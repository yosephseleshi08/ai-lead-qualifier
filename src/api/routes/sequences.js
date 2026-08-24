const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');

router.get('/', async (req, res, next) => {
  try {
    const sequences = await prisma.sequence.findMany({ where: { tenantId: req.tenantId }, orderBy: { createdAt: 'desc' } });
    res.json(sequences);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description, triggerType, triggerConditions, steps } = req.body;
    const sequence = await prisma.sequence.create({
      data: { tenantId: req.tenantId, name, description, triggerType, triggerConditions: triggerConditions || {}, steps: steps || [], status: 'ACTIVE' },
    });
    logger.info(`Sequence created: ${sequence.id}`);
    res.status(201).json(sequence);
  } catch (error) { next(error); }
});

router.post('/:id/enroll', async (req, res, next) => {
  try {
    const { leadIds } = req.body;
    const sequenceId = req.params.id;
    const enrollments = await Promise.all(leadIds.map(leadId => prisma.sequenceEnrollment.create({ data: { sequenceId, leadId, status: 'ACTIVE', currentStep: 0 } })));
    res.status(201).json({ enrolled: enrollments.length });
  } catch (error) { next(error); }
});

module.exports = router;
