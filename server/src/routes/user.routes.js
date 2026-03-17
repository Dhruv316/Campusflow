const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateProfile,
  changePassword,
  getMyStats,
} = require('../controllers/user.controller');

const router = express.Router();

// Named routes before param routes
router.get('/my-stats',         protect, restrictTo('STUDENT'), getMyStats);
router.put('/profile',          protect,                         updateProfile);
router.post('/change-password', protect,                         changePassword);

router.get('/',             protect, restrictTo('ADMIN'), getAllUsers);
router.get('/:id',          protect, restrictTo('ADMIN'), getUserById);
router.patch('/:id/status', protect, restrictTo('ADMIN'), toggleUserStatus);

module.exports = router;
