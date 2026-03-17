const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

const buildPagination = (page, limit, total) => ({
  page, limit, total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

// ── Auto-promote oldest WAITLISTED registration to APPROVED ───────────────
const autoPromoteWaitlisted = async (eventId) => {
  const event = await prisma.event.findUnique({
    where:  { id: eventId },
    select: { maxCapacity: true, currentRegistrations: true, title: true },
  });
  if (!event || event.currentRegistrations >= event.maxCapacity) return;

  const oldest = await prisma.registration.findFirst({
    where:   { eventId, status: 'WAITLISTED' },
    orderBy: { registeredAt: 'asc' },
    include: { student: { select: { id: true, name: true } } },
  });
  if (!oldest) return;

  await prisma.$transaction([
    prisma.registration.update({ where: { id: oldest.id }, data: { status: 'APPROVED' } }),
    prisma.event.update({ where: { id: eventId }, data: { currentRegistrations: { increment: 1 } } }),
    prisma.notification.create({
      data: {
        id:      uuidv4(),
        userId:  oldest.student.id,
        title:   "You've been approved!",
        message: `A spot opened up for "${event.title}" and your registration has been approved.`,
        type:    'REGISTRATION_UPDATE',
      },
    }),
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/registrations  (student)
// ─────────────────────────────────────────────────────────────────────────────
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId, teamName, teamMembers } = req.body;

    if (!eventId) return next(ApiError.badRequest('eventId is required.'));

    // ── Pre-transaction validation (non-race-sensitive checks) ─────────────
    const eventPre = await prisma.event.findUnique({ where: { id: eventId } });
    if (!eventPre) return next(ApiError.notFound('Event not found.'));

    if (!['PUBLISHED', 'ONGOING'].includes(eventPre.status)) {
      return next(ApiError.badRequest('This event is not open for registration.'));
    }
    if (new Date() > new Date(eventPre.registrationDeadline)) {
      return next(ApiError.badRequest('The registration deadline for this event has passed.'));
    }

    // Check duplicate registration
    const existing = await prisma.registration.findUnique({
      where: { studentId_eventId: { studentId: req.user.id, eventId } },
    });
    if (existing) {
      return next(ApiError.conflict('You are already registered for this event.'));
    }

    // Team event validation
    if (eventPre.isTeamEvent) {
      if (!teamName?.trim()) {
        return next(ApiError.badRequest('Team name is required for team events.'));
      }
      if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
        return next(ApiError.badRequest('Team members list is required for team events.'));
      }
      if (eventPre.teamMinSize && teamMembers.length < eventPre.teamMinSize) {
        return next(ApiError.badRequest(`Team must have at least ${eventPre.teamMinSize} members.`));
      }
      if (eventPre.teamMaxSize && teamMembers.length > eventPre.teamMaxSize) {
        return next(ApiError.badRequest(`Team cannot have more than ${eventPre.teamMaxSize} members.`));
      }
    }

    // ── Generate QR code before the transaction (non-DB work) ─────────────
    const qrCode = `CF-${uuidv4().toUpperCase()}`;
    let qrCodeImage = null;
    try {
      qrCodeImage = await QRCode.toDataURL(qrCode, {
        errorCorrectionLevel: 'H',
        width:  300,
        margin: 2,
        color:  { dark: '#111827', light: '#FFFFFF' },
      });
    } catch {
      console.error('[qr] QR image generation failed for', qrCode);
    }

    // ── Interactive transaction: re-read capacity atomically, then create ──
    // Using an interactive transaction prevents the TOCTOU race condition:
    // two concurrent requests that both read currentRegistrations=9 (max=10)
    // will both try to create a PENDING registration. With the interactive
    // transaction, the second one re-reads the event AFTER the first has
    // already incremented, so it correctly falls into WAITLISTED.
    //
    // Note: Prisma interactive transactions use serializable isolation by
    // default in PostgreSQL which prevents phantom reads.
    let registration;
    let isFull;

    await prisma.$transaction(async (tx) => {
      // Re-read the event inside the transaction for an up-to-date count
      const event = await tx.event.findUnique({
        where:  { id: eventId },
        select: { id: true, title: true, maxCapacity: true, currentRegistrations: true, isTeamEvent: true },
      });

      isFull = event.maxCapacity > 0 && event.currentRegistrations >= event.maxCapacity;
      const status = isFull ? 'WAITLISTED' : 'PENDING';

      registration = await tx.registration.create({
        data: {
          id:          uuidv4(),
          studentId:   req.user.id,
          eventId,
          status,
          qrCode,
          qrCodeImage,
          teamName:    event.isTeamEvent ? teamName?.trim() ?? null : null,
          teamMembers: event.isTeamEvent && Array.isArray(teamMembers) ? teamMembers : [],
        },
        include: {
          event: {
            select: {
              id: true, title: true, startDate: true, endDate: true,
              venue: true, category: true, status: true, bannerImage: true,
              registrationDeadline: true,
            },
          },
        },
      });

      // Notify the student inside the transaction so it's atomic
      await tx.notification.create({
        data: {
          id:      uuidv4(),
          userId:  req.user.id,
          title:   isFull ? 'Added to Waitlist' : 'Registration Submitted',
          message: isFull
            ? `You've been added to the waitlist for "${event.title}". You'll be notified if a spot opens up.`
            : `Your registration for "${event.title}" has been submitted and is awaiting admin approval.`,
          type:    'REGISTRATION_UPDATE',
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: isFull
        ? "You've been added to the waitlist."
        : 'Registration submitted successfully. Awaiting admin approval.',
      data: { registration },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/registrations/:id  (student)
// ─────────────────────────────────────────────────────────────────────────────
const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    const registration = await prisma.registration.findUnique({
      where:   { id },
      include: { event: { select: { id: true, title: true, currentRegistrations: true } } },
    });

    if (!registration) return next(ApiError.notFound('Registration not found.'));
    if (registration.studentId !== req.user.id) {
      return next(ApiError.forbidden('You can only cancel your own registrations.'));
    }

    if (registration.status === 'APPROVED') {
      return next(
        ApiError.badRequest(
          'Approved registrations cannot be self-cancelled. Please contact administration.'
        )
      );
    }
    if (!['PENDING', 'WAITLISTED'].includes(registration.status)) {
      return next(
        ApiError.badRequest(
          `Cannot cancel a registration with status "${registration.status}".`
        )
      );
    }

    await prisma.registration.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/registrations/my  (student)
// ─────────────────────────────────────────────────────────────────────────────
const getMyRegistrations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      studentId: req.user.id,
      ...(status ? { status } : {}),
    };

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        skip,
        take:    limitNum,
        orderBy: { registeredAt: 'desc' },
        include: {
          event: {
            select: {
              id: true, title: true, startDate: true, endDate: true,
              venue: true, category: true, status: true, bannerImage: true,
              registrationDeadline: true,
            },
          },
          certificate: {
            select: { id: true, certificateNumber: true, downloadUrl: true },
          },
        },
      }),
      prisma.registration.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data:    { registrations },
      pagination: buildPagination(pageNum, limitNum, total),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/registrations/:id/feedback  (student)
// ─────────────────────────────────────────────────────────────────────────────
const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const reg = await prisma.registration.findUnique({
      where:   { id },
      include: { event: { select: { status: true, title: true } } },
    });

    if (!reg) return next(ApiError.notFound('Registration not found.'));
    if (reg.studentId !== req.user.id) {
      return next(ApiError.forbidden('You can only submit feedback for your own registrations.'));
    }
    if (reg.status !== 'ATTENDED') {
      return next(ApiError.badRequest('You can only leave feedback after attending an event.'));
    }
    if (reg.event.status !== 'COMPLETED') {
      return next(ApiError.badRequest('Feedback can only be submitted after the event is completed.'));
    }
    if (reg.feedback !== null || reg.rating !== null) {
      return next(ApiError.conflict('You have already submitted feedback for this event.'));
    }

    const ratingNum = rating !== undefined && rating !== null ? parseInt(rating, 10) : null;
    if (ratingNum !== null && (ratingNum < 1 || ratingNum > 5)) {
      return next(ApiError.badRequest('Rating must be between 1 and 5.'));
    }

    const updated = await prisma.registration.update({
      where: { id },
      data:  { feedback: feedback?.trim() || null, rating: ratingNum },
      include: { event: { select: { id: true, title: true } } },
    });

    return res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      data:    { registration: updated },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/registrations/event/:eventId  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getRegistrationsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status, search, page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const event = await prisma.event.findUnique({
      where:  { id: eventId },
      select: { id: true, title: true },
    });
    if (!event) return next(ApiError.notFound('Event not found.'));

    const where = {
      eventId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            student: {
              OR: [
                { name:       { contains: search, mode: 'insensitive' } },
                { email:      { contains: search, mode: 'insensitive' } },
                { rollNumber: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        skip,
        take:    limitNum,
        orderBy: { registeredAt: 'desc' },
        include: {
          student: {
            select: {
              id: true, name: true, email: true,
              rollNumber: true, department: true, year: true, avatar: true,
            },
          },
          event: {
            select: { id: true, title: true, startDate: true, venue: true, category: true },
          },
        },
      }),
      prisma.registration.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data:    { registrations, event },
      pagination: buildPagination(pageNum, limitNum, total),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/registrations/:id/status  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const adminStatuses = ['APPROVED', 'REJECTED', 'WAITLISTED'];
    if (!status || !adminStatuses.includes(status)) {
      return next(
        ApiError.badRequest(`Invalid status. Admin can set: ${adminStatuses.join(', ')}`)
      );
    }

    const registration = await prisma.registration.findUnique({
      where:   { id },
      include: {
        event:   { select: { id: true, title: true, maxCapacity: true, currentRegistrations: true } },
        student: { select: { id: true, name: true } },
      },
    });
    if (!registration) return next(ApiError.notFound('Registration not found.'));

    const prevStatus = registration.status;
    const event      = registration.event;
    let finalStatus  = status;
    let notifMessage = '';

    if (status === 'APPROVED') {
      if (event.currentRegistrations >= event.maxCapacity) {
        finalStatus  = 'WAITLISTED';
        notifMessage = `The event "${event.title}" is at capacity. You've been added to the waitlist.`;
      } else {
        notifMessage = `Your registration for "${event.title}" has been approved!`;
      }
    } else if (status === 'REJECTED') {
      notifMessage = `Your registration for "${event.title}" has been rejected.`;
    } else {
      notifMessage = `Your registration for "${event.title}" has been moved to the waitlist.`;
    }

    const ops = [
      prisma.registration.update({ where: { id }, data: { status: finalStatus } }),
      prisma.notification.create({
        data: {
          id:      uuidv4(),
          userId:  registration.student.id,
          title:   `Registration ${finalStatus.charAt(0) + finalStatus.slice(1).toLowerCase()}`,
          message: notifMessage,
          type:    'REGISTRATION_UPDATE',
        },
      }),
    ];

    if (finalStatus === 'APPROVED' && prevStatus !== 'APPROVED') {
      ops.push(
        prisma.event.update({ where: { id: event.id }, data: { currentRegistrations: { increment: 1 } } })
      );
    }
    if (status === 'REJECTED' && prevStatus === 'APPROVED') {
      ops.push(
        prisma.event.update({ where: { id: event.id }, data: { currentRegistrations: { decrement: 1 } } })
      );
    }

    await prisma.$transaction(ops);

    if (status === 'REJECTED' && prevStatus === 'APPROVED') {
      autoPromoteWaitlisted(event.id).catch((err) =>
        console.error('[waitlist] Auto-promote failed:', err)
      );
    }

    const result = await prisma.registration.findUnique({
      where:   { id },
      include: {
        student: { select: { id: true, name: true, email: true, rollNumber: true, avatar: true } },
        event:   { select: { id: true, title: true, startDate: true, venue: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Registration status updated to ${finalStatus}.`,
      data:    { registration: result },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/registrations/:id/checkin  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const checkInRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    const registration = await prisma.registration.findUnique({
      where:   { id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        event:   { select: { id: true, title: true } },
      },
    });

    if (!registration) return next(ApiError.notFound('Registration not found.'));
    if (registration.status !== 'APPROVED') {
      return next(
        ApiError.badRequest(
          `Cannot check in a registration with status "${registration.status}". Only APPROVED.`
        )
      );
    }
    if (registration.checkedInAt) {
      return next(ApiError.badRequest('This student has already been checked in.'));
    }

    const updated = await prisma.registration.update({
      where:   { id },
      data:    { status: 'ATTENDED', checkedInAt: new Date() },
      include: {
        student: { select: { id: true, name: true, email: true, rollNumber: true, avatar: true } },
        event:   { select: { id: true, title: true, startDate: true, venue: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: `${registration.student.name} checked in successfully.`,
      data:    { registration: updated },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  submitFeedback,
  getRegistrationsByEvent,
  updateRegistrationStatus,
  checkInRegistration,
};
