const { logger } = require('../../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });
  if (err.code === 'P2002') return res.status(409).json({ error: 'Resource already exists' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Resource not found' });
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
};

const notFound = (req, res) => res.status(404).json({ error: 'Route not found' });

module.exports = { errorHandler, notFound };
