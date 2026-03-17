const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

// ── Helpers ────────────────────────────────────────────────────────────────

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/events
// ─────────────────────────────────────────────────────────────────────────────
const getAllEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip     = (pageNum - 1) * limitNum;

    // Admins can see all statuses; public only sees PUBLISHED + ONGOING
    const isAdmin = req.user?.role === 'ADMIN';
    const statusFilter = isAdmin
      ? status ? { status } : undefined
      : { status: { in: ['PUBLISHED', 'ONGOING'] } };

    const where = {
      ...(statusFilter || {}),
      ...(category ? { category } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(startDate ? { startDate: { gte: new Date(startDate) } } : {}),
      ...(endDate   ? { endDate:   { lte: new Date(endDate)   } } : {}),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { startDate: 'asc' },
        include: {
          createdBy: { select: { id: true, name: true } },
          _count:    { select: { registrations: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data:    { events },
      pagination: buildPagination(pageNum, limitNum, total),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/events/:id
// ─────────────────────────────────────────────────────────────────────────────
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count:    { select: { registrations: true } },
      },
    });

    if (!event) return next(ApiError.notFound('Event not found.'));

    // If a student is authenticated, include their registration for this event
    let myRegistration = null;
    if (req.user && req.user.role === 'STUDENT') {
      myRegistration = await prisma.registration.findUnique({
        where: { studentId_eventId: { studentId: req.user.id, eventId: id } },
        select: {
          id: true, status: true, qrCode: true,
          registeredAt: true, checkedInAt: true,
          teamName: true, teamMembers: true,
          feedback: true, rating: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data:    { event, myRegistration },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/events
// ─────────────────────────────────────────────────────────────────────────────
const createEvent = async (req, res, next) => {
  try {
    const {
      title, description, category, venue, bannerImage,
      startDate, endDate, registrationDeadline, maxCapacity,
      isTeamEvent = false, teamMinSize, teamMaxSize,
      tags = [], status = 'DRAFT',
    } = req.body;

    // ── Business rule validations ────────────────────────────────────────
    const start    = new Date(startDate);
    const end      = new Date(endDate);
    const deadline = new Date(registrationDeadline);

    if (end < start)
      return next(ApiError.badRequest('End date must be on or after start date.'));
    if (deadline > start)
      return next(ApiError.badRequest('Registration deadline must be on or before the start date.'));
    if (maxCapacity < 1)
      return next(ApiError.badRequest('Maximum capacity must be at least 1.'));
    if (isTeamEvent) {
      if (!teamMinSize || !teamMaxSize)
        return next(ApiError.badRequest('Team min and max size are required for team events.'));
      if (teamMinSize > teamMaxSize)
        return next(ApiError.badRequest('Team min size cannot exceed max size.'));
    }

    const event = await prisma.event.create({
      data: {
        id:                   uuidv4(),
        title,
        description,
        category,
        venue,
        bannerImage:          bannerImage || null,
        startDate:            start,
        endDate:              end,
        registrationDeadline: deadline,
        maxCapacity:          parseInt(maxCapacity, 10),
        isTeamEvent:          Boolean(isTeamEvent),
        teamMinSize:          isTeamEvent ? parseInt(teamMinSize, 10) : null,
        teamMaxSize:          isTeamEvent ? parseInt(teamMaxSize, 10) : null,
        tags:                 Array.isArray(tags) ? tags : [],
        status,
        createdById:          req.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    // ── Notify all active students about the new event (fire-and-forget) ─
    if (status === 'PUBLISHED') {
      notifyAllStudents({
        title:   `New Event: ${event.title}`,
        message: `A new ${event.category.toLowerCase()} event "${event.title}" has been published. Register before ${new Date(registrationDeadline).toLocaleDateString()}.`,
        type:    'NEW_EVENT',
      }).catch((err) => console.error('[notify] Failed to send new event notifications:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data:    { event },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/events/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return next(ApiError.notFound('Event not found.'));

    const {
      title, description, category, venue, bannerImage,
      startDate, endDate, registrationDeadline, maxCapacity,
      isTeamEvent, teamMinSize, teamMaxSize,
      tags, status,
      // createdBy is intentionally excluded
    } = req.body;

    // Build update payload — only include provided fields
    const updateData = {};
    if (title       !== undefined) updateData.title       = title;
    if (description !== undefined) updateData.description = description;
    if (category    !== undefined) updateData.category    = category;
    if (venue       !== undefined) updateData.venue       = venue;
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage || null;
    if (tags        !== undefined) updateData.tags        = Array.isArray(tags) ? tags : [];
    if (status      !== undefined) updateData.status      = status;
    if (maxCapacity !== undefined) updateData.maxCapacity = parseInt(maxCapacity, 10);

    // Date validations if dates are being updated
    const newStart    = startDate            ? new Date(startDate)            : existing.startDate;
    const newEnd      = endDate              ? new Date(endDate)              : existing.endDate;
    const newDeadline = registrationDeadline ? new Date(registrationDeadline) : existing.registrationDeadline;

    if (startDate            !== undefined) updateData.startDate            = newStart;
    if (endDate              !== undefined) updateData.endDate              = newEnd;
    if (registrationDeadline !== undefined) updateData.registrationDeadline = newDeadline;

    if (newEnd < newStart)
      return next(ApiError.badRequest('End date must be on or after start date.'));
    if (newDeadline > newStart)
      return next(ApiError.badRequest('Registration deadline must be before or on the start date.'));

    if (isTeamEvent !== undefined) {
      updateData.isTeamEvent = Boolean(isTeamEvent);
      updateData.teamMinSize = isTeamEvent && teamMinSize ? parseInt(teamMinSize, 10) : null;
      updateData.teamMaxSize = isTeamEvent && teamMaxSize ? parseInt(teamMaxSize, 10) : null;
    }

    const event = await prisma.event.update({
      where: { id },
      data:  updateData,
      include: {
        createdBy: { select: { id: true, name: true } },
        _count:    { select: { registrations: true } },
      },
    });

    // If event just became COMPLETED, trigger certificate eligibility
    if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      markCertificatesEligible(id).catch((err) =>
        console.error('[cert] Failed to mark certificates eligible:', err)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data:    { event },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/events/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return next(ApiError.notFound('Event not found.'));

    if (event.status === 'ONGOING' || event.status === 'COMPLETED') {
      return next(
        ApiError.badRequest(
          `Cannot delete an event with status "${event.status}". ` +
          'Cancel the event first or change its status to DRAFT.'
        )
      );
    }

    // Cascade: delete dependent records in FK dependency order.
    // Notifications are user-owned history — intentionally kept so students
    // retain their inbox records even after an event is deleted.
    await prisma.$transaction([
      prisma.certificate.deleteMany({ where: { eventId: id } }),
      prisma.registration.deleteMany({ where: { eventId: id } }),
      prisma.event.delete({           where: { id } }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/events/:id/status
// ─────────────────────────────────────────────────────────────────────────────
const updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return next(ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return next(ApiError.notFound('Event not found.'));

    const updatedEvent = await prisma.event.update({
      where: { id },
      data:  { status },
    });

    // If cancelled — reject all pending/approved registrations and notify students
    if (status === 'CANCELLED') {
      const affectedRegistrations = await prisma.registration.findMany({
        where: { eventId: id, status: { in: ['PENDING', 'APPROVED', 'WAITLISTED'] } },
        select: { id: true, studentId: true },
      });

      if (affectedRegistrations.length > 0) {
        const notificationData = affectedRegistrations.map((reg) => ({
          id:      uuidv4(),
          userId:  reg.studentId,
          title:   `Event Cancelled: ${event.title}`,
          message: `Unfortunately, the event "${event.title}" has been cancelled. Your registration has been voided.`,
          type:    'REGISTRATION_UPDATE',
        }));

        await prisma.$transaction([
          prisma.registration.updateMany({
            where: { id: { in: affectedRegistrations.map((r) => r.id) } },
            data:  { status: 'REJECTED' },
          }),
          prisma.notification.createMany({ data: notificationData }),
        ]);
      }
    }

    // If completed — mark certificates eligible
    if (status === 'COMPLETED') {
      markCertificatesEligible(id).catch((err) =>
        console.error('[cert] Failed to mark certificates eligible:', err)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Event status updated to ${status}.`,
      data:    { event: updatedEvent },
    });
  } catch (error) {
    next(error);
  }
};

// ── Internal helpers ───────────────────────────────────────────────────────

// Notify all active students
const notifyAllStudents = async ({ title, message, type }) => {
  const students = await prisma.user.findMany({
    where:  { role: 'STUDENT', isActive: true },
    select: { id: true },
  });
  if (students.length === 0) return 0;
  const data = students.map((s) => ({
    id: uuidv4(), userId: s.id, title, message, type,
  }));
  await prisma.notification.createMany({ data });
  return students.length;
};

// Mark all ATTENDED registrations for an event as certificate-eligible
// (in practice: just a log/hook — actual certificate issuance is manual by admin)
const markCertificatesEligible = async (eventId) => {
  const attended = await prisma.registration.findMany({
    where: {
      eventId,
      status: 'ATTENDED',
      certificate: { is: null }, // no certificate issued yet
    },
    select: { id: true, studentId: true },
  });
  console.log(`[cert] ${attended.length} registrations eligible for certificate issuance for event ${eventId}`);
  return attended.length;
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  notifyAllStudents,
};
