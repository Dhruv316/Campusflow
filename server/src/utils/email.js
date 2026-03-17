const nodemailer = require('nodemailer');

// ── Create transporter ─────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ── Base send function ─────────────────────────────────────────────────────
/**
 * Sends an email.
 * @param {object} options - { to, subject, html, text? }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"CampusFlow" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    text: text || '',
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

// ── Email templates ────────────────────────────────────────────────────────

/**
 * Sends a welcome email after successful registration.
 * @param {object} user - { name, email }
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Helvetica Neue', sans-serif; background: #f4f4f5; padding: 40px 0;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: #6C47FF; padding: 32px 40px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">CampusFlow</h1>
          <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px;">College Events Management</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;">Welcome, ${user.name}! 🎉</h2>
          <p style="color: #6B7280; line-height: 1.6; margin: 0 0 24px;">
            Your CampusFlow account is ready. You can now browse and register for college events, track your participation, and collect certificates — all in one place.
          </p>
          <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background: #6C47FF; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Get Started →
          </a>
        </div>
        <div style="padding: 20px 40px; border-top: 1px solid #F3F4F6;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            You're receiving this because you created a CampusFlow account. If this wasn't you, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to CampusFlow 🎓',
    html,
  });
};

/**
 * Sends a registration confirmation email for an event.
 * @param {object} params - { user, event, qrCodeDataUrl }
 */
const sendRegistrationConfirmationEmail = async ({ user, event, qrCodeDataUrl }) => {
  const eventDate = new Date(event.startDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Helvetica Neue', sans-serif; background: #f4f4f5; padding: 40px 0;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: #6C47FF; padding: 32px 40px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">CampusFlow</h1>
          <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px;">Registration Confirmed</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">You're registered! ✅</h2>
          <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px;">Here are your event details:</p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #111827;">${event.title}</p>
            <p style="margin: 0 0 4px; font-size: 13px; color: #6B7280;">📅 ${eventDate}</p>
            <p style="margin: 0; font-size: 13px; color: #6B7280;">📍 ${event.venue}</p>
          </div>
          ${qrCodeDataUrl ? `
          <p style="font-size: 14px; color: #374151; margin: 0 0 12px; font-weight: 500;">Your Entry QR Code:</p>
          <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 160px; height: 160px; display: block; margin-bottom: 8px; border-radius: 8px;" />
          <p style="font-size: 12px; color: #9CA3AF; margin: 0 0 24px;">Present this QR code at the venue for check-in.</p>
          ` : ''}
          <a href="${process.env.CLIENT_URL}/dashboard/registrations" style="display: inline-block; background: #6C47FF; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View My Registrations →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Registration Confirmed: ${event.title}`,
    html,
  });
};

/**
 * Sends a certificate-ready notification email.
 * @param {object} params - { user, event, certificateNumber, downloadUrl }
 */
const sendCertificateEmail = async ({ user, event, certificateNumber, downloadUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Helvetica Neue', sans-serif; background: #f4f4f5; padding: 40px 0;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: #6C47FF; padding: 32px 40px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">CampusFlow</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;">Your Certificate is Ready! 🏅</h2>
          <p style="color: #6B7280; line-height: 1.6; margin: 0 0 16px;">
            Congratulations on attending <strong>${event.title}</strong>. Your certificate of participation is now available for download.
          </p>
          <p style="font-size: 12px; color: #9CA3AF; margin: 0 0 24px;">Certificate No: ${certificateNumber}</p>
          ${downloadUrl ? `
          <a href="${downloadUrl}" style="display: inline-block; background: #6C47FF; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Download Certificate →
          </a>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Certificate Ready: ${event.title}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendRegistrationConfirmationEmail,
  sendCertificateEmail,
};
