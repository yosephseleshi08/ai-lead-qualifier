const { body, param, query } = require('express-validator');

const authValidators = {
  register: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().isLength({ min: 2 }),
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
};

const leadValidators = {
  create: [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().notEmpty(),
    body('company').optional().trim(),
    body('title').optional().trim(),
    body('phone').optional().trim(),
    body('source').optional().trim(),
  ],
  updateStatus: [
    param('id').isUUID(),
    body('status').isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST', 'DISQUALIFIED']),
  ],
  getById: [param('id').isUUID()],
  list: [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('classification').optional().isIn(['HOT', 'WARM', 'COLD', 'NURTURE']),
    query('status').optional().isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST', 'DISQUALIFIED']),
    query('search').optional().trim(),
  ],
};

const sequenceValidators = {
  create: [
    body('name').trim().notEmpty(),
    body('triggerType').isIn(['SCORE_THRESHOLD', 'STATUS_CHANGE', 'MANUAL']),
    body('steps').isArray({ min: 1 }),
  ],
  enroll: [
    param('id').isUUID(),
    body('leadIds').isArray({ min: 1 }),
  ],
};

const settingsValidators = {
  update: [
    body('autoAssign').optional().isBoolean(),
    body('hotLeadAlert').optional().isBoolean(),
    body('scoreThresholdHot').optional().isInt({ min: 0, max: 100 }),
    body('scoreThresholdWarm').optional().isInt({ min: 0, max: 100 }),
  ],
};

module.exports = { authValidators, leadValidators, sequenceValidators, settingsValidators };
