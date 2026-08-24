const OpenAI = require('openai');
const { getBreaker } = require('../utils/circuitBreaker');
const { logger } = require('../utils/logger');
const Redis = require('ioredis');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => logger.error('Redis connection error', { error: err.message }));

const RATE_LIMIT_MAX = parseInt(process.env.AI_RATE_LIMIT_MAX) || 100;
const RATE_LIMIT_WINDOW = parseInt(process.env.AI_RATE_LIMIT_WINDOW) || 3600;

const FALLBACK_SCORES = {
  score: 50, classification: 'WARM', conversionProb: 0.3, sentiment: 0,
  urgencyScore: 10, intentScore: 15, budgetScore: 5, painScore: 5, authorityScore: 5, timingScore: 5,
  aiSummary: 'Unable to analyze - using default scoring.',
  talkingPoints: ['Review lead manually'], actionItems: ['Schedule follow-up call'],
  objections: [], competitorMentions: [], buyingSignals: [], riskFactors: ['AI analysis unavailable'],
};

const buildPrompt = (lead, messages = []) => {
  const msgContext = messages.slice(-10).map(m => `[${m.type} ${m.direction}]: ${m.content.substring(0, 500)}`).join('\n');
  return `You are an elite B2B sales intelligence AI. Analyze this lead and provide a detailed scoring breakdown.

LEAD DATA:
Name: ${lead.name || 'Unknown'}
Title: ${lead.title || 'Unknown'}
Company: ${lead.company || 'Unknown'}
Industry: ${lead.industry || 'Unknown'}
Company Size: ${lead.companySize || 'Unknown'}
Source: ${lead.source}

CONVERSATION HISTORY:
${msgContext || 'No messages yet'}

Respond ONLY with valid JSON in this exact structure:
{
  "score": 0-100,
  "classification": "HOT|WARM|COLD|NURTURE",
  "conversionProb": 0.0-1.0,
  "sentiment": -1.0 to 1.0,
  "urgencyScore": 0-30,
  "intentScore": 0-40,
  "budgetScore": 0-15,
  "painScore": 0-15,
  "authorityScore": 0-10,
  "timingScore": 0-10,
  "aiSummary": "string",
  "talkingPoints": ["string"],
  "actionItems": ["string"],
  "objections": ["string"],
  "competitorMentions": ["string"],
  "buyingSignals": ["string"],
  "riskFactors": ["string"]
}`;
};

const checkRateLimit = async (tenantId) => {
  const key = `rate_limit:ai_scoring:${tenantId}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - RATE_LIMIT_WINDOW;
  try {
    await redis.zremrangebyscore(key, 0, windowStart);
    const currentCount = await redis.zcard(key);
    if (currentCount >= RATE_LIMIT_MAX) {
      return { allowed: false, current: currentCount, limit: RATE_LIMIT_MAX, resetAt: windowStart + RATE_LIMIT_WINDOW };
    }
    await redis.zadd(key, now, `${now}:${Math.random()}`);
    await redis.expire(key, RATE_LIMIT_WINDOW);
    return { allowed: true, current: currentCount + 1, limit: RATE_LIMIT_MAX };
  } catch (err) {
    logger.error('Rate limit check failed', { error: err.message, tenantId });
    return { allowed: true, current: 0, limit: RATE_LIMIT_MAX };
  }
};

const analyzeLead = async (lead, messages = [], tenantId = 'default') => {
  const rateLimit = await checkRateLimit(tenantId);
  if (!rateLimit.allowed) {
    logger.warn(`AI scoring rate limit exceeded for tenant ${tenantId}`, { current: rateLimit.current, limit: rateLimit.limit });
    return { ...FALLBACK_SCORES, aiSummary: `Rate limit exceeded (${rateLimit.current}/${rateLimit.limit} per hour). Using fallback scoring.`, riskFactors: ['AI rate limit exceeded'] };
  }
  const breaker = getBreaker('openai-scoring', { failureThreshold: 3, resetTimeout: 60000 });
  return breaker.execute(async () => {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a B2B lead scoring expert. Output only valid JSON.' },
        { role: 'user', content: buildPrompt(lead, messages) },
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });
    const content = response.choices[0].message.content;
    const result = JSON.parse(content);
    return {
      score: Math.min(100, Math.max(0, result.score || 50)),
      classification: ['HOT', 'WARM', 'COLD', 'NURTURE'].includes(result.classification) ? result.classification : 'WARM',
      conversionProb: Math.min(1, Math.max(0, result.conversionProb || 0.3)),
      sentiment: Math.min(1, Math.max(-1, result.sentiment || 0)),
      urgencyScore: Math.min(30, Math.max(0, result.urgencyScore || 0)),
      intentScore: Math.min(40, Math.max(0, result.intentScore || 0)),
      budgetScore: Math.min(15, Math.max(0, result.budgetScore || 0)),
      painScore: Math.min(15, Math.max(0, result.painScore || 0)),
      authorityScore: Math.min(10, Math.max(0, result.authorityScore || 0)),
      timingScore: Math.min(10, Math.max(0, result.timingScore || 0)),
      aiSummary: result.aiSummary || '',
      talkingPoints: Array.isArray(result.talkingPoints) ? result.talkingPoints : [],
      actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
      objections: Array.isArray(result.objections) ? result.objections : [],
      competitorMentions: Array.isArray(result.competitorMentions) ? result.competitorMentions : [],
      buyingSignals: Array.isArray(result.buyingSignals) ? result.buyingSignals : [],
      riskFactors: Array.isArray(result.riskFactors) ? result.riskFactors : [],
    };
  }, () => {
    logger.warn(`OpenAI circuit breaker fallback used for lead ${lead.id}`);
    return FALLBACK_SCORES;
  });
};

const quickScore = async (lead) => {
  let score = 30;
  if (lead.email && lead.email.includes('@')) score += 10;
  if (lead.company) score += 10;
  if (lead.phone) score += 5;
  if (lead.linkedinUrl) score += 10;
  if (lead.industry) score += 5;
  if (lead.title?.toLowerCase().includes('director') || lead.title?.toLowerCase().includes('vp') || lead.title?.toLowerCase().includes('chief')) score += 15;
  if (lead.companySize && parseInt(lead.companySize) > 100) score += 5;
  return {
    score: Math.min(100, score),
    classification: score >= 80 ? 'HOT' : score >= 60 ? 'WARM' : 'COLD',
    conversionProb: score / 100, sentiment: 0,
    urgencyScore: Math.floor(score * 0.3), intentScore: Math.floor(score * 0.4),
    budgetScore: Math.floor(score * 0.15), painScore: Math.floor(score * 0.15),
    authorityScore: 0, timingScore: 0,
    aiSummary: 'Quick heuristic score (AI detailed analysis pending)',
    talkingPoints: [], actionItems: ['Run full AI analysis'],
    objections: [], competitorMentions: [], buyingSignals: [], riskFactors: [],
  };
};

const analyzeSentiment = async (text) => {
  const breaker = getBreaker('openai-sentiment', { failureThreshold: 5, resetTimeout: 60000 });
  return breaker.execute(async () => {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_FALLBACK_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Analyze sentiment. Return JSON: {sentiment: -1 to 1, confidence: 0-1, emotions: [string]}' },
        { role: 'user', content: text.substring(0, 2000) },
      ],
      temperature: 0.1,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });
    return JSON.parse(response.choices[0].message.content);
  }, () => ({ sentiment: 0, confidence: 0, emotions: [] }));
};

module.exports = { analyzeLead, quickScore, analyzeSentiment, FALLBACK_SCORES, checkRateLimit };
