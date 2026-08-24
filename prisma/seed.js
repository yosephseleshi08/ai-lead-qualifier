const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Corp',
      slug: 'demo-corp',
      plan: 'PRO',
      billingStatus: 'ACTIVE',
      settings: {
        autoAssign: true,
        hotLeadAlert: true,
        scoreThresholdHot: 80,
        scoreThresholdWarm: 60,
        decayThresholdHours: 48,
        enableAudioSummary: true,
      },
      whiteLabel: {
        enabled: false,
        primaryColor: '#3b82f6',
        logoUrl: null,
        customDomain: null,
        senderName: 'Demo Corp',
      },
    },
  });

  const hashedPassword = await bcrypt.hash('demo123456', 12);
  const owner = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash: hashedPassword,
      role: 'OWNER',
      emailVerified: true,
    },
  });

  const sampleLeads = [
    {
      email: 'john.smith@techcorp.com', name: 'John Smith', title: 'VP of Engineering', company: 'TechCorp',
      phone: '+1-555-0101', country: 'USA', score: 92, classification: 'HOT', conversionProb: 0.85, sentiment: 0.6,
      urgencyScore: 28, intentScore: 38, budgetScore: 14, painScore: 12, authorityScore: 9, timingScore: 8,
      aiSummary: 'High-intent VP actively evaluating solutions. Budget approved for Q3. Pain point: current system scaling issues.',
      talkingPoints: ['Mention scalability benchmarks', 'Reference similar company case study', 'Offer pilot program'],
      actionItems: ['Schedule technical demo', 'Send pricing sheet', 'Connect with solutions engineer'],
      industry: 'Technology', companySize: '500-1000', estimatedRevenue: '$50M', status: 'QUALIFIED', source: 'website', assignedToId: owner.id,
      lastActivityAt: new Date(), decayScore: 0,
    },
    {
      email: 'sarah.jones@retailplus.com', name: 'Sarah Jones', title: 'Director of Sales', company: 'RetailPlus',
      phone: '+1-555-0102', country: 'USA', score: 78, classification: 'WARM', conversionProb: 0.55, sentiment: 0.3,
      urgencyScore: 20, intentScore: 30, budgetScore: 12, painScore: 10, authorityScore: 6, timingScore: 5,
      aiSummary: 'Director exploring options. Interested in automation features. Budget flexible but timeline is Q4.',
      talkingPoints: ['Focus on ROI calculator', 'Show automation workflows', 'Discuss integration timeline'],
      actionItems: ['Send product overview', 'Schedule discovery call'],
      industry: 'Retail', companySize: '1000-5000', status: 'CONTACTED', source: 'linkedin',
      lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), decayScore: 2,
    },
    {
      email: 'mike.chen@startup.io', name: 'Mike Chen', title: 'Founder & CEO', company: 'StartupIO',
      phone: '+1-555-0103', country: 'USA', score: 65, classification: 'WARM', conversionProb: 0.35, sentiment: 0.1,
      urgencyScore: 15, intentScore: 22, budgetScore: 8, painScore: 12, authorityScore: 8, timingScore: 3,
      aiSummary: 'Early-stage founder researching tools. Price-sensitive but high authority. Needs starter plan.',
      talkingPoints: ['Emphasize startup-friendly pricing', 'Show quick setup process', 'Offer freemium trial'],
      actionItems: ['Send starter plan details', 'Share startup customer stories'],
      industry: 'SaaS', companySize: '1-50', status: 'NEW', source: 'referral',
      lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), decayScore: 5,
    },
    {
      email: 'emma.wilson@globalbank.com', name: 'Emma Wilson', title: 'Chief Technology Officer', company: 'GlobalBank',
      phone: '+44-555-0104', country: 'UK', score: 95, classification: 'HOT', conversionProb: 0.92, sentiment: 0.8,
      urgencyScore: 30, intentScore: 40, budgetScore: 15, painScore: 14, authorityScore: 10, timingScore: 9,
      aiSummary: 'CTO with urgent compliance deadline. Enterprise budget. Ready to sign within 30 days. High priority.',
      talkingPoints: ['Lead with security certifications', 'Discuss enterprise SLA', 'Reference financial services clients'],
      actionItems: ['Schedule executive meeting', 'Prepare security questionnaire', 'Draft enterprise proposal'],
      industry: 'Financial Services', companySize: '10000+', estimatedRevenue: '$2B', status: 'PROPOSAL', source: 'event', assignedToId: owner.id,
      lastActivityAt: new Date(), decayScore: 0,
    },
    {
      email: 'david.park@manufacturex.com', name: 'David Park', title: 'Operations Manager', company: 'ManufactureX',
      phone: '+1-555-0105', country: 'Canada', score: 45, classification: 'COLD', conversionProb: 0.15, sentiment: -0.2,
      urgencyScore: 8, intentScore: 15, budgetScore: 5, painScore: 8, authorityScore: 4, timingScore: 2,
      aiSummary: 'Operations manager gathering information. No clear timeline. May need nurturing campaign.',
      talkingPoints: ['Share educational content', 'Offer webinar invitation', 'Focus on efficiency gains'],
      actionItems: ['Add to nurture sequence', 'Send industry report'],
      industry: 'Manufacturing', companySize: '500-1000', status: 'NEW', source: 'cold-outreach',
      lastActivityAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), decayScore: 12,
    },
  ];

  for (const leadData of sampleLeads) {
    await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        ...leadData,
        messages: {
          create: [{ content: `Initial contact from ${leadData.source}. ${leadData.aiSummary}`, type: 'SYSTEM', direction: 'INBOUND' }],
        },
      },
    });
  }

  await prisma.sequence.create({
    data: {
      tenantId: tenant.id,
      name: 'Hot Lead Nurture',
      description: '5-touch sequence for hot leads',
      status: 'ACTIVE',
      triggerType: 'SCORE_THRESHOLD',
      triggerConditions: { minScore: 80 },
      steps: [
        { type: 'EMAIL', subject: 'Quick follow-up', body: 'Hi {{name}}, thanks for your interest...', delayHours: 1 },
        { type: 'TASK', title: 'Call {{name}}', description: 'Discuss requirements', delayHours: 24 },
        { type: 'EMAIL', subject: 'Case study', body: 'Hi {{name}}, here is how {{company}}...', delayHours: 72 },
      ],
    },
  });

  console.log('Seed data created successfully');
  console.log('Login with: demo@example.com / demo123456');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
