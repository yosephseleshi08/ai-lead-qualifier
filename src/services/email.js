const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

// ─── Check if Resend is available ──────────────────────────────────

let useResend = false;
let resendClient = null;
let transporter = null;

// Try to load Resend
try {
  const { Resend } = require('resend');
  if (process.env.RESEND_API_KEY) {
    resendClient = new Resend({ apiKey: process.env.RESEND_API_KEY });
    useResend = true;
    logger.info('Resend email client initialized');
  }
} catch (err) {
  logger.info('Resend not installed — using SMTP');
}

// ─── SMTP Transporter (fallback) ───────────────────────────────────

if (!useResend) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
    });

    transporter.verify((error) => {
      if (error) {
        logger.error('SMTP transporter verification failed', { error: error.message });
      } else {
        logger.info('SMTP transporter ready');
      }
    });
  } catch (err) {
    logger.info('SMTP not configured — email will be simulated');
  }
}

// ─── Email Templates (Keep All Your Existing Templates) ────────────

const templates = {
  hotLeadAlert: (data) => ({
    subject: `🔥 HOT LEAD: ${data.leadName} - Score ${data.score}/100`,
    html: `...`, // Your existing template
  }),
  weeklyReport: (data) => ({
    subject: `📊 Weekly Lead Report - ${data.weekRange}`,
    html: `...`, // Your existing template
  }),
  sequenceStep: (data) => ({ subject: data.subject, html: data.body }),
  invite: (data) => ({
    subject: `You've been invited to join ${data.teamName} on AI Lead Qualifier`,
    html: `...`, // Your existing template
  }),
  dealRoomShare: (data) => ({
    subject: `Your personalized deal room from ${data.companyName}`,
    html: `...`, // Your existing template
  }),
  verifyEmail: (data) => ({
    subject: `Verify your email for ${data.appName || 'AI Lead Qualifier'}`,
    html: `...`, // Your existing template
  }),
  passwordReset: (data) => ({
    subject: `Reset your password for ${data.appName || 'AI Lead Qualifier'}`,
    html: `...`, // Your existing template
  }),
};

// ─── Send Email ──────────────────────────────────────────────────────

const sendEmail = async (to, templateName, data, options = {}) => {
  try {
    const template = templates[templateName];
    if (!template) throw new Error(`Template ${templateName} not found`);
    const { subject, html } = template(data);
    const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';
    const appName = process.env.APP_NAME || 'AI Lead Qualifier';

    let info = { messageId: 'simulated-' + Date.now() };

    if (useResend && resendClient) {
      const { data: resendData, error } = await resendClient.emails.send({
        from: `"${appName}" <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: html,
        text: options.text || html.replace(/<[^>]*>/g, ' '),
      });
      if (error) throw new Error(error.message);
      info = { messageId: resendData?.id };
    } else if (transporter) {
      info = await transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text: options.text || html.replace(/<[^>]*>/g, ' '),
        attachments: options.attachments,
      });
    } else {
      logger.info(`[EMAIL SIMULATED] To: ${to} | Subject: ${subject}`);
    }

    logger.info(`Email sent: ${templateName} to ${to}`, { messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Email failed: ${templateName} to ${to}`, { error: error.message });
    return { success: false, error: error.message };
  }
};

const sendBulkEmail = async (recipients, templateName, dataFn, options = {}) => {
  const results = await Promise.allSettled(
    recipients.map(recipient => sendEmail(recipient.email, templateName, dataFn(recipient), options))
  );
  const success = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  logger.info(`Bulk email complete: ${success}/${recipients.length} sent`);
  return { total: recipients.length, success, failed: recipients.length - success };
};

module.exports = { sendEmail, sendBulkEmail, templates };
