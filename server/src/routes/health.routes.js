const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success:   true,
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
    env:       process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
