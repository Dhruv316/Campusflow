const prisma = require('../utils/prisma');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/overview
// ─────────────────────────────────────────────────────────────────────────────
const getOverview = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalEvents,
      publishedEvents,
      totalRegistrations,
      totalStudents,
      totalCertificates,
      attendedCount,
      approvedPlusAttended,
      upcomingEvents,
      avgRatingData,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.registration.count(),
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.certificate.count(),
      prisma.registration.count({ where: { status: 'ATTENDED' } }),
      prisma.registration.count({ where: { status: { in: ['APPROVED', 'ATTENDED'] } } }),
      prisma.event.count({
        where: { status: 'PUBLISHED', startDate: { gt: now } },
      }),
      prisma.registration.aggregate({
        _avg: { rating: true },
        where: { rating: { not: null } },
      }),
    ]);

    const attendanceRate =
      approvedPlusAttended > 0
        ? Math.round((attendedCount / approvedPlusAttended) * 100)
        : 0;

    const avgRating = avgRatingData._avg.rating
      ? Math.round(avgRatingData._avg.rating * 10) / 10
      : null;

    return res.status(200).json({
      success: true,
      data: {
        totalEvents,
        publishedEvents,
        totalRegistrations,
        totalStudents,
        totalCertificates,
        attendanceRate,
        upcomingEvents,
        avgRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/events
// ─────────────────────────────────────────────────────────────────────────────
const getEventAnalytics = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'desc' },
      select: {
        id:                   true,
        title:                true,
        category:             true,
        status:               true,
        maxCapacity:          true,
        currentRegistrations: true,
        startDate:            true,
        registrations: {
          select: { status: true, rating: true },
        },
      },
    });

    const analytics = events.map((event) => {
      const attended = event.registrations.filter((r) => r.status === 'ATTENDED').length;
      const ratings  = event.registrations
        .map((r) => r.rating)
        .filter((r) => r !== null && r !== undefined);

      const avgRating =
        ratings.length > 0
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : null;

      const fillRate =
        event.maxCapacity > 0
          ? Math.round((event.currentRegistrations / event.maxCapacity) * 100)
          : 0;

      return {
        id:                   event.id,
        title:                event.title,
        category:             event.category,
        status:               event.status,
        maxCapacity:          event.maxCapacity,
        currentRegistrations: event.currentRegistrations,
        attendedCount:        attended,
        avgRating,
        fillRate,
        startDate:            event.startDate,
      };
    });

    return res.status(200).json({
      success: true,
      data: { events: analytics },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/trends
// ─────────────────────────────────────────────────────────────────────────────
const getRegistrationTrends = async (req, res, next) => {
  try {
    // Build 30 date keys ending with TODAY (inclusive).
    // i=29 → 29 days ago, i=0 → today.
    // This guarantees today's registrations always appear in the chart.
    const dateKeys = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateKeys.push(d.toISOString().slice(0, 10)); // 'YYYY-MM-DD'
    }

    // Query boundary: midnight 29 days ago  → end of today
    const startOfWindow = new Date();
    startOfWindow.setDate(startOfWindow.getDate() - 29);
    startOfWindow.setHours(0, 0, 0, 0);

    const registrations = await prisma.registration.findMany({
      where:   { registeredAt: { gte: startOfWindow } },
      select:  { registeredAt: true },
      orderBy: { registeredAt: 'asc' },
    });

    // Initialise every day in the window to 0 so gaps render correctly
    const dateMap = Object.fromEntries(dateKeys.map((k) => [k, 0]));

    registrations.forEach((r) => {
      const key = r.registeredAt.toISOString().slice(0, 10);
      if (key in dateMap) dateMap[key]++;
    });

    const trends = dateKeys.map((date) => ({ date, count: dateMap[date] }));

    return res.status(200).json({
      success: true,
      data: { trends },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getEventAnalytics,
  getRegistrationTrends,
};
