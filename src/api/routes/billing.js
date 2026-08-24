const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');

const PLANS = {
  STARTER: process.env.STRIPE_PRICE_STARTER,
  PRO: process.env.STRIPE_PRICE_PRO,
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,
};

const getOrCreateCustomer = async (tenantId, email, name) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (tenant.stripeCustomerId) {
    return tenant.stripeCustomerId;
  }
  const customer = await stripe.customers.create({
    email,
    name: name || tenant.name,
    metadata: { tenantId: tenant.id },
  });
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
};

router.post('/checkout', async (req, res, next) => {
  try {
    const { plan } = req.body; // STARTER, PRO, ENTERPRISE
    const priceId = PLANS[plan];
    if (!priceId) return res.status(400).json({ error: 'Invalid plan' });

    const customerId = await getOrCreateCustomer(req.tenantId, req.user.email, req.user.name);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/settings/billing?canceled=true`,
      metadata: { tenantId: req.tenantId, plan },
    });

    res.json({ url: session.url });
  } catch (error) { next(error); }
});

router.get('/portal', async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });
    if (!tenant?.stripeCustomerId) return res.status(400).json({ error: 'No billing account found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/settings/billing`,
    });

    res.json({ url: session.url });
  } catch (error) { next(error); }
});

router.post('/webhook', async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const tenantId = session.metadata?.tenantId;
        const plan = session.metadata?.plan;
        if (tenantId) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              plan,
              stripeSubscriptionId: session.subscription,
              billingStatus: 'ACTIVE',
            },
          });
          logger.info(`Subscription activated for tenant ${tenantId}`, { plan, subscriptionId: session.subscription });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const subscription = event.data.object;
        const tenant = await prisma.tenant.findFirst({ where: { stripeSubscriptionId: subscription.subscription } });
        if (tenant) {
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { billingStatus: 'PAST_DUE' },
          });
          logger.warn(`Payment failed for tenant ${tenant.id}`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const tenant = await prisma.tenant.findFirst({ where: { stripeSubscriptionId: subscription.id } });
        if (tenant) {
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { plan: 'STARTER', billingStatus: 'CANCELED', stripeSubscriptionId: null },
          });
          logger.info(`Subscription canceled for tenant ${tenant.id}`);
        }
        break;
      }
    }
    res.json({ received: true });
  } catch (error) { next(error); }
});

router.get('/plans', async (req, res) => {
  res.json({
    plans: [
      { id: 'STARTER', name: 'Starter', price: '$49/mo', features: ['1,000 leads', 'Basic AI scoring', 'Email alerts', '2 team members'] },
      { id: 'PRO', name: 'Pro', price: '$149/mo', features: ['10,000 leads', 'Advanced AI scoring', 'CRM sync', 'Slack/Discord alerts', '10 team members', 'White-label'] },
      { id: 'ENTERPRISE', name: 'Enterprise', price: 'Custom', features: ['Unlimited leads', 'Custom AI models', 'Priority support', 'SSO', 'API access', 'Dedicated success manager'] },
    ],
    currentPlan: req.tenant?.plan || 'STARTER',
  });
});

module.exports = router;
