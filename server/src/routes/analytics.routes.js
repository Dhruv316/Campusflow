const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  getOverview,
  getEventAnalytics,
  getRegistrationTrends,
} = require('../controllers/analytics.controller');

const router = express.Router();

router.get('/overview',      protect, restrictTo('ADMIN'), getOverview);
router.get('/events',        protect, restrictTo('ADMIN'), getEventAnalytics);
router.get('/trends',        protect, restrictTo('ADMIN'), getRegistrationTrends);

module.exports = router;
