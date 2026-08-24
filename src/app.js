require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./api/middleware/errorHandler');
const { logger } = require('./utils/logger');
const { verifyTenantIsolation, requireTenant } = require('./api/middleware/tenantIsolation');
const { applyWhiteLabel } = require('./api/middleware/whiteLabel');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later' },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Raw body for Stripe webhooks
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use((req, res, next) => {
  req.id = require('crypto').randomUUID();
  logger.info(`${req.method} ${req.path}`, { requestId: req.id });
  next();
});

app.get('/health', (req, res) => {
  const { isHealthy } = require('./config/database');
  res.json({ status: 'ok', database: isHealthy() });
});

// Public routes (no auth required)
app.use('/api/auth', require('./api/routes/auth'));

// Protected routes
app.use(requireTenant);
app.use(applyWhiteLabel);

app.use('/api/leads', require('./api/routes/leads'));
app.use('/api/settings', require('./api/routes/settings'));
app.use('/api/sequences', require('./api/routes/sequences'));
app.use('/api/reports', require('./api/routes/reports'));
app.use('/api/billing', require('./api/routes/billing'));
app.use('/api/gdpr', require('./api/routes/gdpr'));

// Tenant isolation verification
app.use(verifyTenantIsolation);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
