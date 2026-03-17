const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

const buildPagination = (page, limit, total) => ({
  page, limit, total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/notifications/announce  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const sendAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetType, eventId } = req.body;

    if (!title || !message) {
      return next(ApiError.badRequest('Title and message are required.'));
    }
    if (!['ALL', 'EVENT'].includes(targetType)) {
      return next(ApiError.badRequest("targetType must be 'ALL' or 'EVENT'."));
    }
    if (targetType === 'EVENT' && !eventId) {
      return next(ApiError.badRequest("eventId is required when targetType is 'EVENT'."));
    }

    let userIds = [];

    if (targetType === 'ALL') {
      const students = await prisma.user.findMany({
        where:  { role: 'STUDENT', isActive: true },
        select: { id: true },
      });
      userIds = students.map((s) => s.id);
    } else {
      const event = await prisma.event.findUnique({
        where:  { id: eventId },
        select: { id: true, title: true },
      });
      if (!event) return next(ApiError.notFound('Event not found.'));

      const registrations = await prisma.registration.findMany({
        where:  { eventId, status: { in: ['APPROVED', 'ATTENDED'] } },
        select: { studentId: true },
      });
      userIds = [...new Set(registrations.map((r) => r.studentId))];
    }

    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No eligible recipients found. No notifications sent.',
        data:    { sentCount: 0 },
      });
    }

    const notificationData = userIds.map((userId) => ({
      id: uuidv4(), userId, title, message, type: 'ANNOUNCEMENT',
    }));
    await prisma.notification.createMany({ data: notificationData });

    return res.status(201).json({
      success: true,
      message: `Announcement sent to ${userIds.length} student${userIds.length !== 1 ? 's' : ''}.`,
      data:    { sentCount: userIds.length },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/notifications/admin  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const where = { userId: req.user.id };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data:    { notifications },
      pagination: buildPagination(pageNum, limitNum, total),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/notifications/my  (student or admin)
// ─────────────────────────────────────────────────────────────────────────────
const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, unreadOnly } = req.query;

    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      userId: req.user.id,
      ...(unreadOnly === 'true' ? { isRead: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);

    return res.status(200).json({
      success: true,
      data:    { notifications, unreadCount },
      pagination: buildPagination(pageNum, limitNum, total),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/notifications/:id/read  (any authenticated user)
// ─────────────────────────────────────────────────────────────────────────────
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return next(ApiError.notFound('Notification not found.'));
    if (notification.userId !== req.user.id) {
      return next(ApiError.forbidden('You can only mark your own notifications as read.'));
    }

    const updated = await prisma.notification.update({
      where: { id },
      data:  { isRead: true },
    });

    return res.status(200).json({
      success: true,
      data:    { notification: updated },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/notifications/read-all  (any authenticated user)
// ─────────────────────────────────────────────────────────────────────────────
const markAllRead = async (req, res, next) => {
  try {
    const { count } = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data:  { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: `${count} notification${count !== 1 ? 's' : ''} marked as read.`,
      data:    { updatedCount: count },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendAnnouncement,
  getAdminNotifications,
  getMyNotifications,
  markNotificationRead,
  markAllRead,
};
