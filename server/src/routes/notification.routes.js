const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  sendAnnouncement,
  getAdminNotifications,
  getMyNotifications,
  markNotificationRead,
  markAllRead,
} = require('../controllers/notification.controller');

const router = express.Router();

// Named routes before param routes
router.post('/announce',   protect, restrictTo('ADMIN'), sendAnnouncement);
router.get('/admin',       protect, restrictTo('ADMIN'), getAdminNotifications);
router.get('/my',          protect,                      getMyNotifications);
router.patch('/read-all',  protect,                      markAllRead);
router.patch('/:id/read',  protect,                      markNotificationRead);

module.exports = router;
