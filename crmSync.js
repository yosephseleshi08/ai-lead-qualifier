const axios = require('axios');
const { logger } = require('../utils/logger');

const hubspotClient = axios.create({ baseURL: 'https://api.hubapi.com' });
const salesforceClient = axios.create({ baseURL: 'https://login.salesforce.com' });

const tokenCache = new Map();

const syncToHubSpot = async (lead, apiKey) => {
  try {
    const contact = {
      properties: {
        email: lead.email,
        firstname: lead.name?.split(' ')[0] || '',
        lastname: lead.name?.split(' ').slice(1).join(' ') || '',
        company: lead.company,
        phone: lead.phone,
        jobtitle: lead.title,
        website: lead.website,
        linkedinbio: lead.linkedinUrl,
        ai_lead_score: lead.score,
        ai_classification: lead.classification,
        ai_conversion_probability: lead.conversionProb,
        ai_sentiment: lead.sentiment,
        lead_source: lead.source,
        hs_lead_status: mapStatusToHubSpot(lead.status),
      },
    };
    const { data } = await hubspotClient.post('/crm/v3/objects/contacts', contact, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    logger.info(`Synced lead ${lead.id} to HubSpot`, { hubspotId: data.id });
    return { success: true, crmId: data.id, platform: 'hubspot' };
  } catch (error) {
    logger.error(`HubSpot sync failed for ${lead.id}`, { error: error.message });
    return { success: false, error: error.message };
  }
};

const mapStatusToHubSpot = (status) => {
  const map = { NEW: 'NEW', CONTACTED: 'CONTACTED', QUALIFIED: 'QUALIFIED', PROPOSAL: 'OPEN_DEAL', NEGOTIATION: 'OPEN_DEAL', CONVERTED: 'CUSTOMER', LOST: 'UNQUALIFIED', DISQUALIFIED: 'UNQUALIFIED' };
  return map[status] || 'NEW';
};

const getSalesforceToken = async (integration) => {
  const cacheKey = integration.tenantId || integration.id;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 300000) {
    return { accessToken: cached.accessToken, instanceUrl: cached.instanceUrl };
  }
  try {
    const { data } = await salesforceClient.post('/services/oauth2/token', {
      grant_type: 'refresh_token',
      client_id: process.env.SALESFORCE_CLIENT_ID,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET,
      refresh_token: integration.config.refreshToken,
    });
    const result = { accessToken: data.access_token, instanceUrl: data.instance_url || integration.config.instanceUrl };
    tokenCache.set(cacheKey, { accessToken: result.accessToken, instanceUrl: result.instanceUrl, expiresAt: Date.now() + (data.expires_in || 7200) * 1000 });
    return result;
  } catch (error) {
    logger.error('Salesforce token refresh failed', { error: error.message });
    throw new Error('Failed to refresh Salesforce access token. Re-authentication required.');
  }
};

const getSalesforceAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SALESFORCE_CLIENT_ID,
    redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
    scope: 'api refresh_token',
  });
  return `https://login.salesforce.com/services/oauth2/authorize?${params.toString()}`;
};

const exchangeSalesforceCode = async (code) => {
  const { data } = await salesforceClient.post('/services/oauth2/token', {
    grant_type: 'authorization_code',
    client_id: process.env.SALESFORCE_CLIENT_ID,
    client_secret: process.env.SALESFORCE_CLIENT_SECRET,
    redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
    code,
  });
  return { accessToken: data.access_token, refreshToken: data.refresh_token, instanceUrl: data.instance_url, issuedAt: data.issued_at };
};

const syncToSalesforce = async (lead, integration) => {
  try {
    const { accessToken, instanceUrl } = await getSalesforceToken(integration);
    const sfLead = {
      Email: lead.email,
      FirstName: lead.name?.split(' ')[0] || '',
      LastName: lead.name?.split(' ').slice(1).join(' ') || 'Unknown',
      Company: lead.company || 'Unknown',
      Phone: lead.phone,
      Title: lead.title,
      Website: lead.website,
      LeadSource: lead.source,
      Status: mapStatusToSalesforce(lead.status),
      Description: lead.aiSummary,
    };
    const { data } = await axios.post(`${instanceUrl}/services/data/v58.0/sobjects/Lead/`, sfLead, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    logger.info(`Synced lead ${lead.id} to Salesforce`, { sfId: data.id });
    return { success: true, crmId: data.id, platform: 'salesforce' };
  } catch (error) {
    logger.error(`Salesforce sync failed for ${lead.id}`, { error: error.message });
    return { success: false, error: error.message };
  }
};

const mapStatusToSalesforce = (status) => {
  const map = { NEW: 'Open - Not Contacted', CONTACTED: 'Working - Contacted', QUALIFIED: 'Qualified', PROPOSAL: 'Qualified', NEGOTIATION: 'Qualified', CONVERTED: 'Closed - Converted', LOST: 'Closed - Not Converted', DISQUALIFIED: 'Closed - Not Converted' };
  return map[status] || 'Open - Not Contacted';
};

const syncLead = async (lead, integration) => {
  if (integration.type === 'HUBSPOT') return syncToHubSpot(lead, integration.config.apiKey);
  if (integration.type === 'SALESFORCE') return syncToSalesforce(lead, integration);
  return { success: false, error: 'Unsupported CRM' };
};

module.exports = { syncLead, syncToHubSpot, syncToSalesforce, getSalesforceAuthUrl, exchangeSalesforceCode };
