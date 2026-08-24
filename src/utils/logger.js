const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, json, errors, printf, colorize } = winston.format;
const logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');

const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) msg += ` ${JSON.stringify(metadata)}`;
  return msg;
});

const transports = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), process.env.NODE_ENV === 'development' ? devFormat : json()),
  }),
];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new DailyRotateFile({ filename: path.join(logDir, 'application-%DATE%.log'), datePattern: 'YYYY-MM-DD', zippedArchive: true, maxSize: '20m', maxFiles: '14d', format: combine(timestamp(), json()) }),
    new DailyRotateFile({ filename: path.join(logDir, 'error-%DATE%.log'), datePattern: 'YYYY-MM-DD', zippedArchive: true, maxSize: '20m', maxFiles: '30d', level: 'error', format: combine(timestamp(), json()) })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'ai-lead-qualifier' },
  transports,
  exceptionHandlers: transports,
  rejectionHandlers: transports,
});

const createContextLogger = (req) => {
  return logger.child({ requestId: req.id, tenantId: req.tenantId, userId: req.userId, ip: req.ip, userAgent: req.get('user-agent') });
};

module.exports = { logger, createContextLogger };
