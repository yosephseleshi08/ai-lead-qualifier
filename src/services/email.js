const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

// ─── Email Transporter ───────────────────────────────────────────────

// Check if we should use Resend (preferred) or SMTP
const useResend = !!process.env.RESEND_API_KEY;

let transporter;
let resendClient;

if (useResend) {
  // Use Resend API
  try {
    const { Resend } = require('resend');
    resendClient = new Resend({ apiKey: process.env.RESEND_API_KEY });
    logger.info('Resend email client initialized');
  } catch (err) {
    logger.error('Failed to initialize Resend', { error: err.message });
    useResend = false;
  }
}

if (!useResend) {
  // Use SMTP (nodemailer)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
  });

  transporter.verify((error, success) => {
    if (error) {
      logger.error('SMTP transporter verification failed', { error: error.message });
    } else {
      logger.info('SMTP transporter ready');
    }
  });
}

// ─── Email Templates ──────────────────────────────────────────────────

const templates = {
  hotLeadAlert: (data) => ({
    subject: `🔥 HOT LEAD: ${data.leadName} - Score ${data.score}/100`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 24px; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🔥 Hot Lead Alert</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">AI detected a high-value opportunity</p>
        </div>
        <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="margin: 0 0 8px 0; color: #111;">${data.leadName}</h2>
          <p style="margin: 0; color: #6b7280;">${data.title} at ${data.company}</p>
          <div style="margin: 20px 0; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #6b7280;">Score</span>
              <span style="font-weight: bold; color: #ef4444;">${data.score}/100</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #6b7280;">Conversion Probability</span>
              <span style="font-weight: bold; color: #10b981;">${(data.conversionProb * 100).toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Sentiment</span>
              <span style="font-weight: bold; color: ${data.sentiment > 0 ? '#10b981' : '#ef4444'};">${data.sentiment > 0 ? 'Positive' : 'Neutral'}</span>
            </div>
          </div>
          ${data.aiSummary ? `<div style="margin: 20px 0;"><h3 style="margin: 0 0 8px 0; color: #374151;">AI Summary</h3><p style="margin: 0; color: #4b5563; line-height: 1.6;">${data.aiSummary}</p></div>` : ''}
          ${data.talkingPoints?.length ? `<div style="margin: 20px 0;"><h3 style="margin: 0 0 8px 0; color: #374151;">Recommended Talking Points</h3><ul style="margin: 0; padding-left: 20px; color: #4b5563;">${data.talkingPoints.map(p => `<li style="margin-bottom: 4px;">${p}</li>`).join('')}</ul></div>` : ''}
          <a href="${data.leadUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View Lead in Dashboard →</a>
        </div>
      </div>
    `,
  }),
  weeklyReport: (data) => ({
    subject: `📊 Weekly Lead Report - ${data.weekRange}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1 style="color: #111;">Weekly Performance</h1><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0;"><div style="padding: 16px; background: #fef3c7; border-radius: 8px; text-align: center;"><div style="font-size: 32px; font-weight: bold; color: #d97706;">${data.newLeads}</div><div style="color: #92400e;">New Leads</div></div><div style="padding: 16px; background: #fee2e2; border-radius: 8px; text-align: center;"><div style="font-size: 32px; font-weight: bold; color: #dc2626;">${data.hotLeads}</div><div style="color: #991b1b;">Hot Leads</div></div><div style="padding: 16px; background: #d1fae5; border-radius: 8px; text-align: center;"><div style="font-size: 32px; font-weight: bold; color: #059669;">${data.converted}</div><div style="color: #065f46;">Converted</div></div><div style="padding: 16px; background: #dbeafe; border-radius: 8px; text-align: center;"><div style="font-size: 32px; font-weight: bold; color: #2563eb;">${data.conversionRate}%</div><div style="color: #1e40af;">Conversion Rate</div></div></div><a href="${data.dashboardUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">View Full Report →</a></div>`,
  }),
  sequenceStep: (data) => ({ subject: data.subject, html: data.body }),
  invite: (data) => ({
    subject: `You've been invited to join ${data.teamName} on AI Lead Qualifier`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; text-align: center; padding: 40px 20px;"><h1 style="color: #111; margin-bottom: 8px;">Join ${data.teamName}</h1><p style="color: #6b7280; margin-bottom: 32px;">You've been invited to collaborate on AI-powered lead qualification.</p><a href="${data.inviteUrl}" style="display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Accept Invitation</a><p style="color: #9ca3af; margin-top: 24px; font-size: 12px;">This link expires in 7 days.</p></div>`,
  }),
  dealRoomShare: (data) => ({
    subject: `Your personalized deal room from ${data.companyName}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: ${data.primaryColor}; padding: 32px; color: white; text-align: center; border-radius: 8px 8px 0 0;"><h1 style="margin: 0;">Welcome to Your Deal Room</h1></div><div style="padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-top: none;"><p style="color: #374151; line-height: 1.6;">Hi ${data.leadName},</p><p style="color: #4b5563; line-height: 1.6;">We've prepared a personalized space with everything you need to evaluate our solution.</p><a href="${data.roomUrl}" style="display: inline-block; margin: 20px 0; padding: 14px 32px; background: ${data.primaryColor}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Deal Room →</a></div></div>`,
  }),
  verifyEmail: (data) => ({
    subject: `Verify your email for ${data.appName || 'AI Lead Qualifier'}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; text-align: center; padding: 40px 20px;"><h1 style="color: #111; margin-bottom: 8px;">Verify Your Email</h1><p style="color: #6b7280; margin-bottom: 32px;">Click the button below to verify your email address and activate your account.</p><a href="${data.verifyUrl}" style="display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email Address</a><p style="color: #9ca3af; margin-top: 24px; font-size: 12px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p></div>`,
  }),
  passwordReset: (data) => ({
    subject: `Reset your password for ${data.appName || 'AI Lead Qualifier'}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; text-align: center; padding: 40px 20px;"><h1 style="color: #111; margin-bottom: 8px;">Reset Your Password</h1><p style="color: #6b7280; margin-bottom: 32px;">We received a request to reset your password. Click the button below to choose a new one.</p><a href="${data.resetUrl}" style="display: inline-block; padding: 14px 32px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a><p style="color: #9ca3af; margin-top: 24px; font-size: 12px;">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p></div>`,
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

    let info;

    if (useResend && resendClient) {
      // Send via Resend
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
      // Send via SMTP
      info = await transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text: options.text || html.replace(/<[^>]*>/g, ' '),
        attachments: options.attachments,
      });
    } else {
      // No email provider configured — log only
      logger.info(`[EMAIL SIMULATED] To: ${to} | Subject: ${subject}`);
      return { success: true, messageId: 'simulated-' + Date.now() };
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
