const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
} = require('../controllers/event.controller');

const router = express.Router();

// Public
router.get('/',    getAllEvents);
router.get('/:id', getEventById);

// Admin only
router.post('/',             protect, restrictTo('ADMIN'), createEvent);
router.put('/:id',           protect, restrictTo('ADMIN'), updateEvent);
router.delete('/:id',        protect, restrictTo('ADMIN'), deleteEvent);
router.patch('/:id/status',  protect, restrictTo('ADMIN'), updateEventStatus);

module.exports = router;
