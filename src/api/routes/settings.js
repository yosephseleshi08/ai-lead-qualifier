const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');
const { generateSecureToken } = require('../../utils/encryption');
const { sendEmail } = require('../../services/email');

router.get('/team', async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId },
      include: { users: { select: { id: true, name: true, email: true, role: true, status: true } }, integrations: true },
    });
    res.json(tenant);
  } catch (error) { next(error); }
});

router.patch('/team/settings', async (req, res, next) => {
  try {
    const { autoAssign, hotLeadAlert, scoreThresholdHot, scoreThresholdWarm, decayThresholdHours } = req.body;
    const tenant = await prisma.tenant.update({
      where: { id: req.tenantId },
      data: {
        settings: {
          ...req.tenant.settings,
          ...(autoAssign !== undefined && { autoAssign }),
          ...(hotLeadAlert !== undefined && { hotLeadAlert }),
          ...(scoreThresholdHot !== undefined && { scoreThresholdHot }),
          ...(scoreThresholdWarm !== undefined && { scoreThresholdWarm }),
          ...(decayThresholdHours !== undefined && { decayThresholdHours }),
        },
      },
    });
    logger.info(`Settings updated for tenant ${req.tenantId}`);
    res.json(tenant);
  } catch (error) { next(error); }
});

router.post('/team/invite', async (req, res, next) => {
  try {
    const { email, name, role } = req.body;
    const token = generateSecureToken(32);
    const inviteUrl = `${process.env.FRONTEND_URL}/invite?token=${token}`;
    const user = await prisma.user.create({
      data: { tenantId: req.tenantId, email, name, role: role || 'SALES', status: 'PENDING', inviteToken: token, inviteExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    await sendEmail(email, 'invite', { teamName: req.tenant.name, inviteUrl });
    res.status(201).json({ message: 'Invitation sent', userId: user.id });
  } catch (error) { next(error); }
});

router.patch('/team/white-label', async (req, res, next) => {
  try {
    const { enabled, primaryColor, logoUrl, customDomain, senderName, faviconUrl, loginBackgroundUrl } = req.body;
    const tenant = await prisma.tenant.update({
      where: { id: req.tenantId },
      data: {
        whiteLabel: {
          ...(req.tenant.whiteLabel || {}),
          ...(enabled !== undefined && { enabled }),
          ...(primaryColor !== undefined && { primaryColor }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(customDomain !== undefined && { customDomain }),
          ...(senderName !== undefined && { senderName }),
          ...(faviconUrl !== undefined && { faviconUrl }),
          ...(loginBackgroundUrl !== undefined && { loginBackgroundUrl }),
        },
      },
    });
    logger.info(`White-label settings updated for tenant ${req.tenantId}`);
    res.json(tenant.whiteLabel);
  } catch (error) { next(error); }
});

module.exports = router;
