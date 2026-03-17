const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const buildPagination = (page, limit, total) => ({
  page, limit, total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

const USER_SELECT = {
  id: true, name: true, email: true, role: true,
  rollNumber: true, department: true, year: true,
  phone: true, avatar: true, isActive: true,
  createdAt: true, updatedAt: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/users  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { name:       { contains: search, mode: 'insensitive' } },
              { email:      { contains: search, mode: 'insensitive' } },
              { rollNumber: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' }, select: USER_SELECT,
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data:    { users },
      pagination: buildPagination(pageNum, limitNum, total),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/users/:id  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) return next(ApiError.notFound('User not found.'));

    const [registrationCount, certificateCount] = await Promise.all([
      prisma.registration.count({ where: { studentId: id } }),
      prisma.certificate.count( { where: { studentId: id } }),
    ]);

    return res.status(200).json({
      success: true,
      data:    { user, registrationCount, certificateCount },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/users/:id/status  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return next(ApiError.badRequest('You cannot deactivate your own account.'));
    }

    const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) return next(ApiError.notFound('User not found.'));

    const updated = await prisma.user.update({
      where:  { id },
      data:   { isActive: !user.isActive },
      select: USER_SELECT,
    });

    return res.status(200).json({
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      data:    { user: updated },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/users/profile  (student or admin)
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, year, avatar } = req.body;

    if (phone && !/^[+\d\s\-]{7,20}$/.test(phone)) {
      return next(ApiError.badRequest('Invalid phone number format.'));
    }

    const updateData = {};
    if (name       !== undefined) updateData.name       = name.trim();
    if (phone      !== undefined) updateData.phone      = phone?.trim() || null;
    if (department !== undefined) updateData.department = department?.trim() || null;
    if (year       !== undefined) updateData.year       = year ? parseInt(year, 10) : null;
    if (avatar     !== undefined) updateData.avatar     = avatar?.trim() || null;

    const user = await prisma.user.update({
      where:  { id: req.user.id },
      data:   updateData,
      select: USER_SELECT,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data:    { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/users/change-password  (student or admin)
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(ApiError.badRequest('currentPassword, newPassword, and confirmPassword are all required.'));
    }
    if (newPassword !== confirmPassword) {
      return next(ApiError.badRequest('New password and confirmation do not match.'));
    }
    if (newPassword.length < 8) {
      return next(ApiError.badRequest('New password must be at least 8 characters.'));
    }

    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { id: true, role: true, password: true },
    });

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return next(ApiError.unauthorized('Current password is incorrect.'));
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return next(ApiError.badRequest('New password must be different from your current password.'));
    }

    const hashedNew = await bcrypt.hash(newPassword, 12);

    // 1. Update password + delete ALL existing refresh tokens in one transaction.
    //    This invalidates all other devices immediately.
    await prisma.$transaction([
      prisma.user.update({ where: { id: req.user.id }, data: { password: hashedNew } }),
      prisma.refreshToken.deleteMany({ where: { userId: req.user.id } }),
    ]);

    // 2. Issue a fresh token pair for THIS device so the current session
    //    keeps working. The client should store these and replace the old ones.
    const newAccessToken  = generateAccessToken(req.user.id, req.user.role);
    const newRefreshToken = generateRefreshToken(req.user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        token:     newRefreshToken,
        userId:    req.user.id,
        expiresAt,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Other devices have been signed out.',
      data: {
        // Return fresh tokens so the current session stays active
        accessToken:  newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/users/my-stats  (student)
// ─────────────────────────────────────────────────────────────────────────────
const getMyStats = async (req, res, next) => {
  try {
    const [registeredCount, attendedCount, certificatesCount] = await Promise.all([
      prisma.registration.count({
        where: { studentId: req.user.id, status: { not: 'REJECTED' } },
      }),
      prisma.registration.count({
        where: { studentId: req.user.id, status: 'ATTENDED' },
      }),
      prisma.certificate.count({
        where: { studentId: req.user.id },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data:    { registeredCount, attendedCount, certificatesCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateProfile,
  changePassword,
  getMyStats,
};
