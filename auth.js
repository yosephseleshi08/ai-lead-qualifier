const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');
const { generateSecureToken } = require('../../utils/encryption');
const { sendEmail } = require('../../services/email');

const JWT_EXPIRES = '7d';
const RESET_EXPIRES = 60 * 60 * 1000;

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, tenantName } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName || `${name}'s Team`,
        slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        plan: 'STARTER',
        settings: { autoAssign: true, hotLeadAlert: true, scoreThresholdHot: 80, scoreThresholdWarm: 60, decayThresholdHours: 48 },
      },
    });
    const verifyToken = generateSecureToken(32);
    const user = await prisma.user.create({
      data: { tenantId: tenant.id, email, name, passwordHash: hashedPassword, role: 'OWNER', emailVerifyToken: verifyToken },
    });
    await sendEmail(email, 'verifyEmail', {
      appName: process.env.APP_NAME,
      verifyUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`,
    });
    const token = jwt.sign({ userId: user.id, tenantId: tenant.id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    logger.info(`User registered: ${email}`);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified, tenant: { id: tenant.id, name: tenant.name, plan: tenant.plan } },
      message: 'Please check your email to verify your account.',
    });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status === 'PENDING') return res.status(403).json({ error: 'Account pending invitation acceptance' });
    if (user.status === 'DELETED') return res.status(403).json({ error: 'Account deactivated' });
    const token = jwt.sign({ userId: user.id, tenantId: user.tenantId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    logger.info(`User logged in: ${email}`);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified, tenant: { id: user.tenant.id, name: user.tenant.name, plan: user.tenant.plan } },
    });
  } catch (error) { next(error); }
});

router.get('/me', async (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role, emailVerified: req.user.emailVerified, tenant: req.user.tenant } });
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, emailVerifyToken: null } });
    logger.info(`Email verified for user ${user.email}`);
    res.json({ message: 'Email verified successfully.' });
  } catch (error) { next(error); }
});

router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ error: 'Email already verified' });
    const verifyToken = generateSecureToken(32);
    await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken: verifyToken } });
    await sendEmail(email, 'verifyEmail', { appName: process.env.APP_NAME, verifyUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}` });
    logger.info(`Verification email resent to ${email}`);
    res.json({ message: 'Verification email sent.' });
  } catch (error) { next(error); }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const resetToken = generateSecureToken(32);
    await prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: resetToken, passwordResetExpires: new Date(Date.now() + RESET_EXPIRES) } });
    await sendEmail(email, 'passwordReset', { appName: process.env.APP_NAME, resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}` });
    logger.info(`Password reset requested for ${email}`);
    res.json({ message: 'If an account exists, a password reset email has been sent.' });
  } catch (error) { next(error); }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await prisma.user.findFirst({ where: { passwordResetToken: token, passwordResetExpires: { gt: new Date() } } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashedPassword, passwordResetToken: null, passwordResetExpires: null } });
    logger.info(`Password reset completed for user ${user.email}`);
    res.json({ message: 'Password reset successfully.' });
  } catch (error) { next(error); }
});

module.exports = router;
