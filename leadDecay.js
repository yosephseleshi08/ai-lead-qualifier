const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

const DECAY_RATE_PER_DAY = 2; // Points lost per day of inactivity
const MAX_DECAY = 30; // Maximum points that can be lost
const REENGAGEMENT_BONUS = 5; // Points restored on re-engagement

const calculateDecay = (lead) => {
  const now = new Date();
  const lastActivity = lead.lastActivityAt || lead.createdAt;
  const daysInactive = Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));

  if (daysInactive <= 0) return { decayScore: 0, daysInactive: 0, effectiveScore: lead.score };

  const rawDecay = daysInactive * DECAY_RATE_PER_DAY;
  const decayScore = Math.min(rawDecay, MAX_DECAY);
  const effectiveScore = Math.max(0, lead.score - decayScore);

  return { decayScore, daysInactive, effectiveScore };
};

const applyDecayToAllLeads = async (tenantId) => {
  const leads = await prisma.lead.findMany({
    where: {
      tenantId,
      status: { notIn: ['CONVERTED', 'LOST', 'DISQUALIFIED'] },
    },
  });

  let updated = 0;
  for (const lead of leads) {
    const { decayScore, effectiveScore } = calculateDecay(lead);
    if (lead.decayScore !== decayScore || lead.score !== effectiveScore) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          decayScore,
          score: effectiveScore,
          classification: effectiveScore >= 80 ? 'HOT' : effectiveScore >= 60 ? 'WARM' : effectiveScore >= 40 ? 'COLD' : 'NURTURE',
        },
      });
      updated++;
    }
  }

  logger.info(`Lead decay applied for tenant ${tenantId}`, { leadsChecked: leads.length, leadsUpdated: updated });
  return { checked: leads.length, updated };
};

const recordActivity = async (leadId, tenantId) => {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, tenantId } });
  if (!lead) return null;

  const now = new Date();
  const wasReengaged = lead.decayScore > 0;

  const updateData = {
    lastActivityAt: now,
    decayScore: 0,
  };

  if (wasReengaged) {
    const restoredScore = Math.min(100, lead.score + REENGAGEMENT_BONUS);
    updateData.score = restoredScore;
    updateData.classification = restoredScore >= 80 ? 'HOT' : restoredScore >= 60 ? 'WARM' : restoredScore >= 40 ? 'COLD' : 'NURTURE';

    await prisma.leadEvent.create({
      data: {
        leadId,
        type: 'REENGAGED',
        description: `Lead re-engaged. Score restored from ${lead.score} to ${restoredScore} (+${REENGAGEMENT_BONUS})`,
      },
    });
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: updateData,
  });

  return updated;
};

const getDecayReport = async (tenantId) => {
  const [decayingLeads, avgDecay, maxDecay] = await Promise.all([
    prisma.lead.count({ where: { tenantId, decayScore: { gt: 0 } } }),
    prisma.lead.aggregate({ where: { tenantId }, _avg: { decayScore: true } }),
    prisma.lead.aggregate({ where: { tenantId }, _max: { decayScore: true } }),
  ]);

  const totalActive = await prisma.lead.count({
    where: { tenantId, status: { notIn: ['CONVERTED', 'LOST', 'DISQUALIFIED'] } },
  });

  return {
    totalActive,
    decayingLeads,
    decayRate: totalActive > 0 ? ((decayingLeads / totalActive) * 100).toFixed(1) : 0,
    averageDecay: Math.round(avgDecay._avg.decayScore || 0),
    maximumDecay: maxDecay._max.decayScore || 0,
  };
};

module.exports = { calculateDecay, applyDecayToAllLeads, recordActivity, getDecayReport, DECAY_RATE_PER_DAY, MAX_DECAY, REENGAGEMENT_BONUS };
