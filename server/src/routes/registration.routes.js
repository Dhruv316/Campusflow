const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  submitFeedback,
  getRegistrationsByEvent,
  updateRegistrationStatus,
  checkInRegistration,
} = require('../controllers/registration.controller');

const router = express.Router();

// ── Named routes first (prevent shadowing by /:id) ─────────────────────────
router.post('/',              protect, restrictTo('STUDENT'), registerForEvent);
router.get('/my',             protect, restrictTo('STUDENT'), getMyRegistrations);
router.get('/event/:eventId', protect, restrictTo('ADMIN'),   getRegistrationsByEvent);

// ── Param routes ───────────────────────────────────────────────────────────
router.delete('/:id',         protect, restrictTo('STUDENT'), cancelRegistration);
router.patch('/:id/status',   protect, restrictTo('ADMIN'),   updateRegistrationStatus);
router.post('/:id/checkin',   protect, restrictTo('ADMIN'),   checkInRegistration);
router.post('/:id/feedback',  protect, restrictTo('STUDENT'), submitFeedback);

module.exports = router;
