const axios = require('axios');
const { sendEmail } = require('./email');
const { logger } = require('../utils/logger');

const slackClient = axios.create({ timeout: 5000 });
const discordClient = axios.create({ timeout: 5000 });

// ─── Redis Fallback (No Redis = In-Memory) ─────────────────────────

let redis;
let useRedis = false;

try {
  // Only try to connect if REDIS_URL or REDIS_HOST is set
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    const Redis = require('ioredis');
    
    if (process.env.REDIS_URL) {
      redis = new Redis(process.env.REDIS_URL, {
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });
    } else {
      redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });
    }
    
    redis.on('error', (err) => {
      logger.error('Redis connection error in alerting', { error: err.message });
      useRedis = false;
    });
    
    redis.on('connect', () => {
      logger.info('Redis connected in alerting');
      useRedis = true;
    });
    
    // If Redis is taking too long to connect, fallback to in-memory
    setTimeout(() => {
      if (!useRedis) {
        logger.info('Redis connection timeout in alerting — using in-memory fallback');
        useRedis = false;
      }
    }, 5000);
  } else {
    logger.info('Redis not configured for alerting — using in-memory');
    useRedis = false;
  }
} catch (err) {
  logger.error('Failed to initialize Redis for alerting', { error: err.message });
  useRedis = false;
}

// ─── In-Memory Store (Fallback) ─────────────────────────────────────

const memoryStore = new Map();

const getInMemoryData = (key) => {
  if (memoryStore.has(key)) {
    const data = memoryStore.get(key);
    if (data.expiresAt && Date.now() > data.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return data.value;
  }
  return null;
};

const setInMemoryData = (key, value, ttlSeconds) => {
  memoryStore.set(key, {
    value: value,
    expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
  });
};

// ─── Anomaly Detection ─────────────────────────────────────────────

const getAnomalyKey = (tenantId) => `anomaly:${tenantId}`;

const detectAnomaly = async (tenantId, currentMetrics) => {
  const key = getAnomalyKey(tenantId);
  let state;
  
  try {
    // Try Redis first
    if (useRedis && redis) {
      const raw = await redis.get(key);
      state = raw ? JSON.parse(raw) : { baseline: { volume: 0, samples: 0 }, lastAlert: null, history: [] };
    } else {
      // Use in-memory fallback
      const raw = getInMemoryData(key);
      state = raw ? JSON.parse(raw) : { baseline: { volume: 0, samples: 0 }, lastAlert: null, history: [] };
    }
  } catch (err) {
    logger.error('Failed to read anomaly state', { error: err.message });
    state = { baseline: { volume: 0, samples: 0 }, lastAlert: null, history: [] };
  }
  
  const alpha = 0.3;
  state.baseline.volume = state.baseline.volume * (1 - alpha) + currentMetrics.newLeads * alpha;
  state.baseline.samples++;
  state.history.push(currentMetrics);
  if (state.history.length > 30) state.history.shift();
  
  try {
    const serialized = JSON.stringify(state);
    if (useRedis && redis) {
      await redis.set(key, serialized, 'EX', 86400 * 7);
    } else {
      setInMemoryData(key, serialized, 86400 * 7);
    }
  } catch (err) {
    logger.error('Failed to persist anomaly state', { error: err.message });
  }
  
  if (state.baseline.samples < 7) return null;
  
  if (currentMetrics.newLeads < state.baseline.volume * 0.5 && currentMetrics.newLeads > 0) {
    const now = Date.now();
    if (!state.lastAlert || now - state.lastAlert > 86400000) {
      state.lastAlert = now;
      try {
        const serialized = JSON.stringify(state);
        if (useRedis && redis) {
          await redis.set(key, serialized, 'EX', 86400 * 7);
        } else {
          setInMemoryData(key, serialized, 86400 * 7);
        }
      } catch (err) {}
      return {
        type: 'VOLUME_DROP', severity: 'HIGH',
        message: `Lead volume dropped ${((1 - currentMetrics.newLeads / state.baseline.volume) * 100).toFixed(0)}% below baseline`,
        current: currentMetrics.newLeads, baseline: Math.round(state.baseline.volume),
      };
    }
  }
  
  if (state.history.length >= 7) {
    const avgConversion = state.history.slice(-7).reduce((s, h) => s + (h.conversionRate || 0), 0) / 7;
    if (currentMetrics.conversionRate < avgConversion * 0.7 && currentMetrics.conversionRate > 0) {
      return {
        type: 'CONVERSION_DROP', severity: 'MEDIUM',
        message: `Conversion rate dropped to ${currentMetrics.conversionRate.toFixed(1)}% (avg: ${avgConversion.toFixed(1)}%)`,
        current: currentMetrics.conversionRate, baseline: avgConversion,
      };
    }
  }
  return null;
};

// ─── Alert Functions ─────────────────────────────────────────────────

const sendSlackAlert = async (webhookUrl, payload) => {
  try {
    await slackClient.post(webhookUrl, {
      text: payload.title,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: payload.title, emoji: true } },
        { type: 'section', fields: [
          { type: 'mrkdwn', text: `*Lead:*\n${payload.leadName}` },
          { type: 'mrkdwn', text: `*Score:*\n${payload.score}/100` },
          { type: 'mrkdwn', text: `*Company:*\n${payload.company}` },
          { type: 'mrkdwn', text: `*Conversion:*\n${(payload.conversionProb * 100).toFixed(1)}%` },
        ]},
        { type: 'section', text: { type: 'mrkdwn', text: `*AI Summary:*\n${payload.aiSummary?.substring(0, 300)}...` } },
        { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'View Lead', emoji: true }, url: payload.leadUrl, style: 'primary' }] },
      ],
    });
    return { success: true };
  } catch (error) {
    logger.error('Slack alert failed', { error: error.message });
    return { success: false, error: error.message };
  }
};

const sendDiscordAlert = async (webhookUrl, payload) => {
  try {
    await discordClient.post(webhookUrl, {
      embeds: [{
        title: payload.title,
        color: payload.score >= 90 ? 0xef4444 : payload.score >= 70 ? 0xf59e0b : 0x3b82f6,
        fields: [
          { name: 'Lead', value: payload.leadName, inline: true },
          { name: 'Score', value: `${payload.score}/100`, inline: true },
          { name: 'Company', value: payload.company || 'N/A', inline: true },
          { name: 'Conversion Probability', value: `${(payload.conversionProb * 100).toFixed(1)}%`, inline: true },
          { name: 'AI Summary', value: payload.aiSummary?.substring(0, 300) + '...' || 'N/A' },
        ],
        timestamp: new Date().toISOString(),
        url: payload.leadUrl,
      }],
    });
    return { success: true };
  } catch (error) {
    logger.error('Discord alert failed', { error: error.message });
    return { success: false, error: error.message };
  }
};

const sendHotLeadAlert = async (tenant, lead, settings = {}) => {
  const results = [];
  if (settings.hotLeadAlert !== false) {
    const recipients = [];
    if (lead.assignedTo?.email) recipients.push(lead.assignedTo.email);
    const managers = tenant.users?.filter(u => ['ADMIN', 'MANAGER'].includes(u.role)) || [];
    recipients.push(...managers.map(m => m.email));
    for (const email of [...new Set(recipients)]) {
      const res = await sendEmail(email, 'hotLeadAlert', {
        leadName: lead.name, title: lead.title, company: lead.company, score: lead.score,
        conversionProb: lead.conversionProb, sentiment: lead.sentiment, aiSummary: lead.aiSummary,
        talkingPoints: lead.talkingPoints, leadUrl: `${process.env.FRONTEND_URL}/leads/${lead.id}`,
      });
      results.push({ channel: 'email', ...res });
    }
  }
  const slackIntegration = tenant.integrations?.find(i => i.type === 'SLACK' && i.status === 'CONNECTED');
  if (slackIntegration?.config?.webhookUrl) {
    const res = await sendSlackAlert(slackIntegration.config.webhookUrl, {
      title: `🔥 HOT LEAD: ${lead.name}`, leadName: lead.name, company: lead.company,
      score: lead.score, conversionProb: lead.conversionProb, aiSummary: lead.aiSummary,
      leadUrl: `${process.env.FRONTEND_URL}/leads/${lead.id}`,
    });
    results.push({ channel: 'slack', ...res });
  }
  const discordIntegration = tenant.integrations?.find(i => i.type === 'DISCORD' && i.status === 'CONNECTED');
  if (discordIntegration?.config?.webhookUrl) {
    const res = await sendDiscordAlert(discordIntegration.config.webhookUrl, {
      title: `🔥 HOT LEAD: ${lead.name}`, leadName: lead.name, company: lead.company,
      score: lead.score, conversionProb: lead.conversionProb, aiSummary: lead.aiSummary,
      leadUrl: `${process.env.FRONTEND_URL}/leads/${lead.id}`,
    });
    results.push({ channel: 'discord', ...res });
  }
  return results;
};

module.exports = { sendHotLeadAlert, sendSlackAlert, sendDiscordAlert, detectAnomaly };
