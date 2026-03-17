const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  issueCertificate,
  getAllCertificates,
  getMyCertificates,
  downloadCertificate,
} = require('../controllers/certificate.controller');

const router = express.Router();

// Named routes before param routes
router.get('/admin',                  protect, restrictTo('ADMIN'),   getAllCertificates);
router.get('/my',                     protect, restrictTo('STUDENT'), getMyCertificates);
router.post('/issue/:registrationId', protect, restrictTo('ADMIN'),   issueCertificate);
router.get('/:id/download',           protect, restrictTo('STUDENT'), downloadCertificate);

module.exports = router;
