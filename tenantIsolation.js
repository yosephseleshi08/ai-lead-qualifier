const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');

const verifyTenantIsolation = async (req, res, next) => {
  if (!req.tenantId || !req.userId) return next();
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.userId,
        action: `${req.method} ${req.path}`,
        entityType: req.path.split('/')[2]?.toUpperCase(),
        ip: req.ip,
      },
    });
  } catch (err) {
    logger.error('Audit log failed', { error: err.message });
  }
  next();
};

const requireTenant = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, include: { tenant: true } });
    if (!user || user.tenantId !== decoded.tenantId) return res.status(401).json({ error: 'Invalid token' });
    req.userId = user.id;
    req.tenantId = user.tenantId;
    req.user = user;
    req.tenant = user.tenant;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyTenantIsolation, requireTenant };
