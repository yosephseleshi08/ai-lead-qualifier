const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

const assignLead = async (lead, tenantId, options = {}) => {
  const { autoAssign = true, respectTerritory = true, respectLoad = true } = options;

  if (!autoAssign) return { assignedToId: null, reason: 'auto-assign disabled' };

  const reps = await prisma.user.findMany({
    where: {
      tenantId,
      role: { in: ['SALES', 'MANAGER'] },
      status: 'ACTIVE',
    },
    include: { assignedLeads: { where: { status: { notIn: ['CONVERTED', 'LOST', 'DISQUALIFIED'] } } } },
  });

  if (reps.length === 0) {
    return { assignedToId: null, reason: 'no active reps' };
  }

  let eligibleReps = reps;
  if (respectLoad) {
    eligibleReps = reps.filter(rep => {
      const maxLeads = rep.settings?.maxLeads || rep.maxLeads || 50;
      return rep.assignedLeads.length < maxLeads;
    });
  }

  if (eligibleReps.length === 0) {
    return { assignedToId: null, reason: 'all reps at max load' };
  }

  const scoredReps = eligibleReps.map(rep => {
    let score = 100;
    const maxLeads = rep.settings?.maxLeads || rep.maxLeads || 50;

    const loadRatio = rep.assignedLeads.length / maxLeads;
    score -= loadRatio * 40;

    if (respectTerritory && rep.territory) {
      const territories = rep.territory.split(',').map(t => t.trim().toLowerCase());
      const leadCountry = (lead.country || '').toLowerCase();
      const leadState = (lead.state || '').toLowerCase();
      if (territories.some(t => leadCountry.includes(t) || leadState.includes(t))) {
        score += 30;
      } else {
        score -= 20;
      }
    }

    if (rep.specialties?.length > 0 && lead.industry) {
      const industry = lead.industry.toLowerCase();
      if (rep.specialties.some(s => industry.includes(s.toLowerCase()))) {
        score += 20;
      }
    }

    const perf = rep.performance || {};
    const conversionRate = perf.conversionRate || 0.3;
    score += (conversionRate - 0.3) * 50;

    const lastAssigned = rep.assignedLeads.length > 0 
      ? Math.max(...rep.assignedLeads.map(l => l.assignedAt?.getTime() || 0))
      : 0;
    const hoursSinceLast = (Date.now() - lastAssigned) / 3600000;
    score += Math.min(hoursSinceLast * 2, 20);

    return { ...rep, routingScore: score };
  });

  scoredReps.sort((a, b) => b.routingScore - a.routingScore);
  const bestRep = scoredReps[0];

  await prisma.user.update({
    where: { id: bestRep.id },
    data: { currentLoad: { increment: 1 } },
  });

  logger.info(`Lead ${lead.id} assigned to ${bestRep.email}`, { score: bestRep.routingScore, reason: 'smart-routing' });

  return {
    assignedToId: bestRep.id,
    assignedTo: bestRep,
    reason: 'smart-routing',
    routingScore: bestRep.routingScore,
  };
};

const reassignLead = async (leadId, newUserId, tenantId, reason = 'manual') => {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId },
    include: { assignedTo: true },
  });

  if (!lead) throw new Error('Lead not found');

  if (lead.assignedToId) {
    await prisma.user.update({
      where: { id: lead.assignedToId },
      data: { currentLoad: { decrement: 1 } },
    });
  }

  await prisma.user.update({
    where: { id: newUserId },
    data: { currentLoad: { increment: 1 } },
  });

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      assignedToId: newUserId,
      assignedAt: new Date(),
      assignedBy: reason,
    },
  });

  await prisma.leadEvent.create({
    data: {
      leadId,
      userId: newUserId,
      type: 'ASSIGNED',
      description: `Reassigned: ${reason}`,
    },
  });

  return updated;
};

module.exports = { assignLead, reassignLead };
