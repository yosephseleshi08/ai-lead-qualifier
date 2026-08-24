const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/database');
const { analyzeLead, quickScore } = require('../../services/aiScoring');
const { enrichLead } = require('../../services/enrichment');
const { assignLead } = require('../../services/routing');
const { sendHotLeadAlert } = require('../../services/alerting');
const { syncLead } = require('../../services/crmSync');
const { recordActivity, applyDecayToAllLeads, getDecayReport } = require('../../services/leadDecay');
const { logger } = require('../../utils/logger');

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, classification, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { tenantId: req.tenantId };
    if (classification) where.classification = classification;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where, skip, take: parseInt(limit), orderBy: { score: 'desc' },
        include: { assignedTo: { select: { id: true, name: true, email: true } }, _count: { select: { messages: true } } },
      }),
      prisma.lead.count({ where }),
    ]);
    res.json({ data: leads, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { email, name, company, title, phone, source, linkedinUrl, industry, companySize } = req.body;
    const quickScores = await quickScore({ email, name, company, title, phone, linkedinUrl, industry, companySize });
    const enriched = await enrichLead({ email, name, company, title, phone, linkedinUrl, industry, companySize, id: 'temp' });
    const lead = await prisma.lead.create({
      data: {
        tenantId: req.tenantId, email,
        name: enriched.name || name,
        company: enriched.company || company,
        title: enriched.title || title,
        phone, source: source || 'manual',
        linkedinUrl: enriched.linkedinUrl || linkedinUrl,
        industry: enriched.industry || industry,
        companySize: enriched.companySize || companySize,
        score: quickScores.score, classification: quickScores.classification,
        conversionProb: quickScores.conversionProb, aiSummary: quickScores.aiSummary, status: 'NEW',
        lastActivityAt: new Date(),
      },
    });
    analyzeLead(lead, [], req.tenantId).then(async (aiScores) => {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          score: aiScores.score, classification: aiScores.classification, conversionProb: aiScores.conversionProb,
          sentiment: aiScores.sentiment, urgencyScore: aiScores.urgencyScore, intentScore: aiScores.intentScore,
          budgetScore: aiScores.budgetScore, painScore: aiScores.painScore, authorityScore: aiScores.authorityScore,
          timingScore: aiScores.timingScore, aiSummary: aiScores.aiSummary, talkingPoints: aiScores.talkingPoints,
          actionItems: aiScores.actionItems, objections: aiScores.objections, competitorMentions: aiScores.competitorMentions,
          buyingSignals: aiScores.buyingSignals, riskFactors: aiScores.riskFactors,
        },
      });
      if (aiScores.classification === 'HOT') {
        const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId }, include: { users: true, integrations: true } });
        const updatedLead = await prisma.lead.findUnique({ where: { id: lead.id }, include: { assignedTo: true } });
        await sendHotLeadAlert(tenant, updatedLead, tenant.settings);
      }
    }).catch(err => logger.error('Background AI scoring failed', { error: err.message }));
    const assignment = await assignLead(lead, req.tenantId, req.tenant.settings);
    if (assignment.assignedToId) {
      await prisma.lead.update({ where: { id: lead.id }, data: { assignedToId: assignment.assignedToId, assignedAt: new Date() } });
    }
    const crmIntegration = await prisma.integration.findFirst({ where: { tenantId: req.tenantId, status: 'CONNECTED' } });
    if (crmIntegration) syncLead(lead, crmIntegration).catch(err => logger.error('CRM sync failed', { error: err.message }));
    res.status(201).json(lead);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 50 },
        events: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) { next(error); }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const lead = await prisma.lead.update({ where: { id: req.params.id, tenantId: req.tenantId }, data: { status } });
    await prisma.leadEvent.create({ data: { leadId: lead.id, userId: req.userId, type: 'STATUS_CHANGED', description: `Status changed to ${status}` } });
    await recordActivity(lead.id, req.tenantId);
    res.json(lead);
  } catch (error) { next(error); }
});

router.get('/analytics/dashboard', async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [totalLeads, hotLeads, convertedLeads, recentLeads, avgScore, leadsByStatus, leadsBySource, decayReport] = await Promise.all([
      prisma.lead.count({ where: { tenantId } }),
      prisma.lead.count({ where: { tenantId, classification: 'HOT' } }),
      prisma.lead.count({ where: { tenantId, status: 'CONVERTED' } }),
      prisma.lead.count({ where: { tenantId, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.lead.aggregate({ where: { tenantId }, _avg: { score: true } }),
      prisma.lead.groupBy({ by: ['status'], where: { tenantId }, _count: { id: true } }),
      prisma.lead.groupBy({ by: ['source'], where: { tenantId }, _count: { id: true } }),
      getDecayReport(tenantId),
    ]);
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : 0;
    res.json({ totalLeads, hotLeads, convertedLeads, recentLeads, avgScore: Math.round(avgScore._avg.score || 0), conversionRate, leadsByStatus, leadsBySource, decayReport });
  } catch (error) { next(error); }
});

router.post('/decay/apply', async (req, res, next) => {
  try {
    const result = await applyDecayToAllLeads(req.tenantId);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/:id/activity', async (req, res, next) => {
  try {
    const lead = await recordActivity(req.params.id, req.tenantId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) { next(error); }
});

module.exports = router;
