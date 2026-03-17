const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

const buildPagination = (page, limit, total) => ({
  page, limit, total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

// ── Generate certificate number: CF-YYYY-XXXXXX ───────────────────────────
const generateCertificateNumber = () => {
  const year  = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const suffix = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `CF-${year}-${suffix}`;
};

// ── Build HTML for the certificate ────────────────────────────────────────
const buildCertificateHTML = ({ studentName, eventTitle, eventDate, certNumber, issuedDate }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      background: #ffffff;
      width: 794px;
      height: 562px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cert {
      width: 740px;
      height: 520px;
      border: 8px solid #6C47FF;
      border-radius: 12px;
      padding: 40px 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
      background: linear-gradient(135deg, #fdfcff 0%, #f3f0ff 100%);
    }
    .cert::before {
      content: '';
      position: absolute;
      inset: 10px;
      border: 2px solid #d9d0ff;
      border-radius: 6px;
      pointer-events: none;
    }
    .logo {
      font-family: 'Arial', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #6C47FF;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .divider {
      width: 80px;
      height: 3px;
      background: #6C47FF;
      margin: 12px auto;
      border-radius: 2px;
    }
    .cert-title {
      font-size: 28px;
      color: #1f2937;
      font-weight: 400;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }
    .presented {
      font-size: 13px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .student-name {
      font-size: 36px;
      color: #6C47FF;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .event-label {
      font-size: 13px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .event-title {
      font-size: 20px;
      color: #1f2937;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .event-date {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 24px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      width: 100%;
      font-size: 11px;
      color: #9ca3af;
      font-family: 'Arial', sans-serif;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="logo">CampusFlow</div>
    <div class="divider"></div>
    <div class="cert-title">Certificate of Participation</div>
    <div class="presented">This certifies that</div>
    <div class="student-name">${studentName}</div>
    <div class="event-label">has successfully participated in</div>
    <div class="event-title">${eventTitle}</div>
    <div class="event-date">${eventDate}</div>
    <div class="footer">
      <span>Cert No: ${certNumber}</span>
      <span>Issued: ${issuedDate}</span>
    </div>
  </div>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/certificates/issue/:registrationId  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const issueCertificate = async (req, res, next) => {
  try {
    const { registrationId } = req.params;

    const registration = await prisma.registration.findUnique({
      where:   { id: registrationId },
      include: {
        student:     { select: { id: true, name: true, email: true } },
        event:       { select: { id: true, title: true } },
        certificate: true,
      },
    });

    if (!registration) return next(ApiError.notFound('Registration not found.'));
    if (registration.status !== 'ATTENDED') {
      return next(
        ApiError.badRequest(
          `Certificate can only be issued for ATTENDED registrations. ` +
          `Current status: ${registration.status}.`
        )
      );
    }
    if (registration.certificate) {
      return next(
        ApiError.conflict(
          `A certificate has already been issued. Number: ${registration.certificate.certificateNumber}`
        )
      );
    }

    // Generate unique certificate number (retry on collision)
    let certNumber;
    for (let attempt = 0; attempt < 5; attempt++) {
      certNumber = generateCertificateNumber();
      const exists = await prisma.certificate.findUnique({
        where:  { certificateNumber: certNumber },
      });
      if (!exists) break;
    }

    const certificate = await prisma.certificate.create({
      data: {
        id:                uuidv4(),
        certificateNumber: certNumber,
        registrationId,
        studentId:         registration.student.id,
        eventId:           registration.event.id,
        issuedAt:          new Date(),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        event:   { select: { id: true, title: true } },
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        id:      uuidv4(),
        userId:  registration.student.id,
        title:   'Your Certificate is Ready! 🏅',
        message: `Your certificate for "${registration.event.title}" has been issued. Certificate No: ${certNumber}`,
        type:    'CERTIFICATE_READY',
      },
    });

    return res.status(201).json({
      success: true,
      message: `Certificate issued. Number: ${certNumber}`,
      data:    { certificate },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/certificates/admin  (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAllCertificates = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const where = search
      ? {
          OR: [
            { student: { name:  { contains: search, mode: 'insensitive' } } },
            { event:   { title: { contains: search, mode: 'insensitive' } } },
            { certificateNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        skip,
        take:    limitNum,
        orderBy: { issuedAt: 'desc' },
        include: {
          student: { select: { id: true, name: true, email: true, rollNumber: true, avatar: true } },
          event:   { select: { id: true, title: true, startDate: true, category: true } },
        },
      }),
      prisma.certificate.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data:    { certificates },
      pagination: buildPagination(pageNum, limitNum, total),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/certificates/my  (student)
// ─────────────────────────────────────────────────────────────────────────────
const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where:   { studentId: req.user.id },
      orderBy: { issuedAt: 'desc' },
      include: {
        event: {
          select: {
            id: true, title: true, startDate: true,
            category: true, bannerImage: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data:    { certificates },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/certificates/:id/download  (student)
// ─────────────────────────────────────────────────────────────────────────────
const downloadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where:   { id },
      include: {
        student: { select: { id: true, name: true } },
        event:   { select: { id: true, title: true, startDate: true } },
      },
    });

    if (!certificate) return next(ApiError.notFound('Certificate not found.'));
    if (certificate.studentId !== req.user.id) {
      return next(ApiError.forbidden('You can only download your own certificates.'));
    }

    const eventDate = new Date(certificate.event.startDate).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const html = buildCertificateHTML({
      studentName: certificate.student.name,
      eventTitle:  certificate.event.title,
      eventDate,
      certNumber:  certificate.certificateNumber,
      issuedDate,
    });

    // Try html-pdf-node for PDF generation
    try {
      const htmlPdf = require('html-pdf-node');
      const file    = { content: html };
      const options = {
        format:    'A4',
        landscape: true,
        margin:    { top: '10px', bottom: '10px', left: '10px', right: '10px' },
        printBackground: true,
      };

      const pdfBuffer = await htmlPdf.generatePdf(file, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="certificate-${certificate.certificateNumber}.pdf"`
      );
      return res.send(pdfBuffer);
    } catch (pdfErr) {
      // Fallback: return HTML as a downloadable file if PDF generation fails
      console.error('[pdf] PDF generation failed, sending HTML fallback:', pdfErr.message);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="certificate-${certificate.certificateNumber}.html"`
      );
      return res.send(html);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueCertificate,
  getAllCertificates,
  getMyCertificates,
  downloadCertificate,
};
