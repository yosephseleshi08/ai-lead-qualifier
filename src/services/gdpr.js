const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * GDPR / CCPA Compliance Service
 * 
 * DISCLAIMER: These utilities assist with compliance workflows but do NOT
 * constitute legal advice. The deployer is solely responsible for ensuring
 * full compliance with GDPR, CCPA, and all applicable privacy regulations.
 * See LEGAL_NOTES.md for details.
 */

const exportUserData = async (tenantId, userId) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      users: true,
      leads: {
        include: { messages: true, events: true, sequenceEnrollments: true },
      },
      sequences: true,
      integrations: true,
      auditLogs: { where: { userId } },
    },
  });

  if (!tenant) throw new Error('Tenant not found');

  const user = tenant.users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  // Sanitize sensitive fields before export
  const sanitizedUsers = tenant.users.map(u => ({
    ...u,
    passwordHash: '[REDACTED]',
    emailVerifyToken: '[REDACTED]',
    passwordResetToken: '[REDACTED]',
    inviteToken: '[REDACTED]',
  }));

  return {
    exportDate: new Date().toISOString(),
    version: '2.1.0',
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      createdAt: tenant.createdAt,
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
    users: sanitizedUsers,
    leads: tenant.leads,
    sequences: tenant.sequences,
    integrations: tenant.integrations.map(i => ({
      ...i,
      config: '[REDACTED — contains OAuth tokens]',
    })),
    auditLogs: tenant.auditLogs,
  };
};

const eraseUserData = async (tenantId, targetUserId, requestingUserId) => {
  const requestingUser = await prisma.user.findUnique({
    where: { id: requestingUserId },
    include: { tenant: true },
  });

  if (!requestingUser || requestingUser.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  const isOwnerOrAdmin = ['OWNER', 'ADMIN'].includes(requestingUser.role);
  const isSelf = targetUserId === requestingUserId;

  if (!isOwnerOrAdmin && !isSelf) {
    throw new Error('Insufficient permissions to erase this user');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser || targetUser.tenantId !== tenantId) {
    throw new Error('User not found');
  }

  // Anonymize instead of hard-delete to preserve lead history integrity
  const anonymizedEmail = `deleted-${targetUserId}@anonymized.local`;
  const anonymizedName = 'Deleted User';

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      email: anonymizedEmail,
      name: anonymizedName,
      passwordHash: '[REDACTED]',
      status: 'DELETED',
      emailVerified: false,
      emailVerifyToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      inviteToken: null,
      inviteExpires: null,
      currentLoad: 0,
    },
  });

  // Anonymize lead events created by this user
  await prisma.leadEvent.updateMany({
    where: { userId: targetUserId },
    data: { userId: null },
  });

  logger.info(`User data erased/anonymized`, { targetUserId, tenantId, requestedBy: requestingUserId });

  return {
    message: 'User data has been anonymized. Lead history is preserved with user references removed.',
    userId: targetUserId,
    anonymizedAt: new Date().toISOString(),
  };
};

const recordConsent = async (tenantId, visitorId, consent, ip, userAgent) => {
  const record = await prisma.consentLog.create({
    data: {
      tenantId,
      visitorId,
      consent: JSON.stringify(consent),
      ip: ip ? ip.split('.').slice(0, 2).join('.') + '.0.0' : null, // Partial IP for privacy
      userAgent: userAgent?.substring(0, 500),
    },
  });
  return record;
};

const getConsentStatus = async (tenantId, visitorId) => {
  const latest = await prisma.consentLog.findFirst({
    where: { tenantId, visitorId },
    orderBy: { createdAt: 'desc' },
  });
  return latest ? JSON.parse(latest.consent) : null;
};

module.exports = { exportUserData, eraseUserData, recordConsent, getConsentStatus };
