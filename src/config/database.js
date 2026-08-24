const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'minimal',
});

prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  const duration = after - before;
  if (process.env.LOG_SLOW_QUERIES === 'true' && duration > 500) {
    console.warn(`Slow query (${duration}ms): ${params.model}.${params.action}`);
  }
  return result;
});

let isHealthy = true;
const checkConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    isHealthy = true;
  } catch (err) {
    isHealthy = false;
    console.error('Database connection lost:', err.message);
  }
};
setInterval(checkConnection, 30000);

module.exports = { prisma, isHealthy: () => isHealthy };
