const { prisma } = require('../../config/database');

const applyWhiteLabel = async (req, res, next) => {
  if (!req.tenantId) return next();
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId }, select: { whiteLabel: true, name: true } });
    if (tenant?.whiteLabel?.enabled) {
      res.locals.whiteLabel = tenant.whiteLabel;
      res.locals.brandName = tenant.whiteLabel.senderName || tenant.name;
    } else {
      res.locals.whiteLabel = null;
      res.locals.brandName = tenant?.name || process.env.APP_NAME;
    }
  } catch (err) {
    // Non-blocking
  }
  next();
};

module.exports = { applyWhiteLabel };
