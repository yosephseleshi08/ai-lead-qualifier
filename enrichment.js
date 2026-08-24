const axios = require('axios');
const { getBreaker } = require('../utils/circuitBreaker');
const { logger } = require('../utils/logger');

// BYOK (Bring Your Own Key) — All enrichment services are optional.
// The buyer must obtain their own API keys and comply with each provider's Terms of Service.
// No API keys are bundled or resold with this software.

const hunterClient = process.env.HUNTER_API_KEY
  ? axios.create({ baseURL: 'https://api.hunter.io/v2', timeout: 5000 })
  : null;

const clearbitClient = process.env.CLEARBIT_API_KEY
  ? axios.create({ baseURL: 'https://person.clearbit.com/v2', timeout: 5000, headers: { Authorization: `Bearer ${process.env.CLEARBIT_API_KEY}` } })
  : null;

const enrichWithHunter = async (email) => {
  if (!hunterClient || !process.env.HUNTER_API_KEY) {
    logger.info('Hunter.io skipped: HUNTER_API_KEY not configured');
    return { deliverable: true, score: null };
  }
  const breaker = getBreaker('hunter-api', { failureThreshold: 5, resetTimeout: 60000 });
  return breaker.execute(async () => {
    const { data } = await hunterClient.get('/email-verifier', { params: { email, api_key: process.env.HUNTER_API_KEY } });
    return { deliverable: data.data?.result === 'deliverable', score: data.data?.score, disposable: data.data?.disposable, webmail: data.data?.webmail, mxRecords: data.data?.mx_records };
  }, () => ({ deliverable: true, score: null }));
};

const enrichWithClearbit = async (email) => {
  if (!clearbitClient || !process.env.CLEARBIT_API_KEY) {
    logger.info('Clearbit skipped: CLEARBIT_API_KEY not configured');
    return { person: null, company: null };
  }
  const breaker = getBreaker('clearbit-api', { failureThreshold: 5, resetTimeout: 60000 });
  return breaker.execute(async () => {
    const { data } = await clearbitClient.get('/combined/find', { params: { email } });
    return {
      person: { name: data.person?.name?.fullName, title: data.person?.employment?.title, role: data.person?.employment?.role, seniority: data.person?.employment?.seniority, avatar: data.person?.avatar, linkedin: data.person?.linkedin?.handle, twitter: data.person?.twitter?.handle },
      company: { name: data.company?.name, domain: data.company?.domain, industry: data.company?.category?.industry, sector: data.company?.category?.sector, employees: data.company?.metrics?.employees, revenue: data.company?.metrics?.estimatedAnnualRevenue, raised: data.company?.metrics?.raised, tech: data.company?.tech, logo: data.company?.logo, location: data.company?.geo },
    };
  }, () => ({ person: null, company: null }));
};

const enrichLead = async (lead) => {
  const results = await Promise.allSettled([
    enrichWithHunter(lead.email),
    enrichWithClearbit(lead.email),
  ]);
  const [hunter, clearbit] = results.map(r => r.status === 'fulfilled' ? r.value : null);
  const enriched = {
    name: clearbit?.person?.name || lead.name,
    title: clearbit?.person?.title || lead.title,
    company: clearbit?.company?.name || lead.company,
    industry: clearbit?.company?.industry || lead.industry,
    companySize: clearbit?.company?.employees ? String(clearbit.company.employees) : lead.companySize,
    estimatedRevenue: clearbit?.company?.revenue,
    technologies: clearbit?.company?.tech || lead.technologies,
    linkedinUrl: clearbit?.person?.linkedin ? `https://linkedin.com/in/${clearbit.person.linkedin}` : lead.linkedinUrl,
    twitterHandle: clearbit?.person?.twitter || lead.twitterHandle,
    avatarUrl: clearbit?.person?.avatar || lead.avatarUrl,
    emailValid: hunter?.deliverable,
    emailScore: hunter?.score,
    enrichmentSource: ['hunter', 'clearbit'].filter((_, i) => results[i].status === 'fulfilled' && results[i].value),
  };
  logger.info(`Enriched lead ${lead.id}`, { sources: enriched.enrichmentSource });
  return enriched;
};

module.exports = { enrichLead, enrichWithHunter, enrichWithClearbit };
