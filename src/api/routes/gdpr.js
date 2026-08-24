const express = require('express');
const router = express.Router();
const { exportUserData, eraseUserData, recordConsent, getConsentStatus } = require('../../services/gdpr');
const { logger } = require('../../utils/logger');

router.post('/export', async (req, res, next) => {
  try {
    const data = await exportUserData(req.tenantId, req.userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="gdpr-export-${req.tenantId}.json"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (error) { next(error); }
});

router.delete('/erase', async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const result = await eraseUserData(req.tenantId, userId, req.userId);
    res.json(result);
  } catch (error) { next(error); }
});

router.post('/consent', async (req, res, next) => {
  try {
    const { visitorId, consent } = req.body;
    const record = await recordConsent(req.tenantId, visitorId, consent, req.ip, req.get('user-agent'));
    res.json(record);
  } catch (error) { next(error); }
});

router.get('/consent/:visitorId', async (req, res, next) => {
  try {
    const status = await getConsentStatus(req.tenantId, req.params.visitorId);
    res.json({ consent: status });
  } catch (error) { next(error); }
});

module.exports = router;
