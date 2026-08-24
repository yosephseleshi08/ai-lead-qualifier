const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/database');

router.get('/forecast', async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const leads = await prisma.lead.findMany({
      where: { tenantId, createdAt: { gte: ninetyDaysAgo } },
      select: { score: true, conversionProb: true, classification: true, status: true, createdAt: true },
    });
    const hotLeads = leads.filter(l => l.classification === 'HOT');
    const warmLeads = leads.filter(l => l.classification === 'WARM');
    const predictedRevenue = hotLeads.reduce((sum, l) => sum + (l.conversionProb * 10000), 0) + warmLeads.reduce((sum, l) => sum + (l.conversionProb * 5000), 0);
    const monthly = {};
    leads.forEach(l => {
      const month = l.createdAt.toISOString().slice(0, 7);
      if (!monthly[month]) monthly[month] = { leads: 0, hot: 0, converted: 0 };
      monthly[month].leads++;
      if (l.classification === 'HOT') monthly[month].hot++;
      if (l.status === 'CONVERTED') monthly[month].converted++;
    });
    res.json({ predictedRevenue: Math.round(predictedRevenue), totalPipeline: leads.length, hotCount: hotLeads.length, warmCount: warmLeads.length, monthlyTrend: Object.entries(monthly).map(([month, data]) => ({ month, ...data })) });
  } catch (error) { next(error); }
});

router.get('/pipeline', async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const byStatus = await prisma.lead.groupBy({ by: ['status'], where: { tenantId }, _count: { id: true }, _avg: { score: true, conversionProb: true } });
    const byRep = await prisma.user.findMany({
      where: { tenantId, role: { in: ['SALES', 'MANAGER'] } },
      select: { id: true, name: true, _count: { assignedLeads: true } },
    });
    res.json({ byStatus, byRep });
  } catch (error) { next(error); }
});

module.exports = router;
