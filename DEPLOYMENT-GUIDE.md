# 🚀 Deployment Guide — From Zero to Live in 30 Minutes

## Overview

This guide walks you through deploying LeadIQ to production.

**What you'll deploy:**
- Frontend → Vercel (free tier)
- Backend → Render or Railway (free tier)
- Database → Render PostgreSQL or Supabase (free tier)
- Redis → Upstash (free tier)

**Total cost to start: $0**

---

## Step 1: Deploy Frontend to Vercel (5 minutes)

### 1.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-lead-qualifier.git
git push -u origin main
```

### 1.2 Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Select your `ai-lead-qualifier` repo
4. Vercel auto-detects Next.js — just click "Deploy"

### 1.3 Environment Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

**Generate a secret:**
```bash
openssl rand -base64 32
```

### 1.4 Redeploy
Vercel will auto-redeploy when you add env vars.

**Your frontend is now live!** 🎉

---

## Step 2: Deploy Backend to Render (10 minutes)

### 2.1 Create PostgreSQL Database
1. Go to [render.com](https://render.com)
2. Click "New" → "PostgreSQL"
3. Name: `leadiq-db`
4. Region: Choose closest to your users
5. Click "Create Database"
6. Copy the "Internal Database URL" — you'll need it

### 2.2 Create Redis Instance (Upstash)
1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Click "Create Database"
4. Name: `leadiq-redis`
5. Region: Same as your Render region
6. Copy the Redis URL

### 2.3 Deploy Backend Service
1. In Render, click "New" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name:** `leadiq-api`
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma migrate deploy && npx prisma db seed`
   - **Start Command:** `npm start`
4. Add Environment Variables:
```
DATABASE_URL=your-render-postgres-url
REDIS_URL=your-upstash-redis-url
JWT_SECRET=same-as-nextauth-secret
ENCRYPTION_KEY=your-32-char-encryption-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
CORS_ORIGIN=https://your-app.vercel.app
```
5. Click "Create Web Service"

**Your backend is now live!** 🎉

---

## Step 3: Update Frontend API URL (2 minutes)

1. Copy your Render service URL (e.g., `https://leadiq-api.onrender.com`)
2. Go to Vercel → Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` to your Render URL
4. Vercel will auto-redeploy

---

## Step 4: Configure Stripe (10 minutes)

### 4.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up (takes 2 minutes)
3. Get your API keys from Developers → API Keys

### 4.2 Create Products & Prices
1. Go to Products → Add Product
2. Create 3 products:
   - Starter Plan — $299/month
   - Growth Plan — $799/month
   - Enterprise Plan — Custom
3. Copy the Price IDs

### 4.3 Add to Backend Env Vars
In Render, add:
```
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

### 4.4 Configure Webhooks
1. In Stripe → Developers → Webhooks
2. Add endpoint: `https://your-api.onrender.com/api/billing/webhook`
3. Select events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Configure OpenAI (5 minutes)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / log in
3. Go to API Keys → Create new secret key
4. Copy the key
5. Add to Render env vars: `OPENAI_API_KEY=sk-...`

**Set usage limits!** Go to Billing → Usage Limits → Set a hard limit (e.g., $20/month) so you don't get surprise bills.

---

## Step 6: Configure Pinecone (5 minutes)

1. Go to [pinecone.io](https://pinecone.io)
2. Sign up (free tier: 1 index, 100K vectors)
3. Create index:
   - Name: `lead-patterns`
   - Dimensions: `1536` (for OpenAI embeddings)
   - Metric: `cosine`
4. Copy API key and environment
5. Add to Render env vars:
```
PINECONE_API_KEY=your-key
PINECONE_INDEX=lead-patterns
PINECONE_ENVIRONMENT=your-env
```

---

## Step 7: Test Everything (5 minutes)

### 7.1 Test Frontend
```
https://your-app.vercel.app
```
- Should show landing page
- Click "Start Free Trial" → should go to login
- Login with demo credentials → should show dashboard

### 7.2 Test API
```bash
curl https://your-api.onrender.com/api/health
```
- Should return `{"status":"ok"}`

### 7.3 Test AI Copilot
- Go to `/ai-copilot`
- Type: "Score my top leads"
- Should return AI-generated response

### 7.4 Test Stripe
- Go to `/billing`
- Click "Upgrade" on Growth plan
- Should redirect to Stripe Checkout

---

## Step 8: Custom Domain (Optional, 5 minutes)

### 8.1 Add Domain to Vercel
1. Vercel → Project Settings → Domains
2. Add your domain (e.g., `app.yourcompany.com`)
3. Follow DNS instructions

### 8.2 Update CORS
In Render env vars, update:
```
CORS_ORIGIN=https://app.yourcompany.com
```

### 8.3 Update Stripe Webhooks
Update webhook URL to your custom domain.

---

## 🎉 You're Live!

Your complete AI lead qualification platform is now deployed:

- **Landing Page:** `https://your-domain.com`
- **Dashboard:** `https://your-domain.com/dashboard`
- **API:** `https://your-api.onrender.com`

### Next Steps
1. Replace demo data with real data
2. Customize white-label settings in `/settings`
3. Add your first real lead
4. Start selling! 🚀

---

## Troubleshooting

### Frontend shows "404" or blank page
- Check Vercel build logs
- Make sure `next.config.js` is correct
- Verify all env vars are set

### API returns "CORS error"
- Check `CORS_ORIGIN` matches your frontend URL exactly
- Include `https://` and no trailing slash

### Stripe checkout fails
- Verify `STRIPE_SECRET_KEY` is correct
- Check that Price IDs match your Stripe products
- Ensure webhook URL is correct

### AI Copilot not working
- Verify `OPENAI_API_KEY` is set
- Check OpenAI usage limits
- Look at Render logs for errors

### Database connection fails
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Check Render PostgreSQL is "Available"
- Try connecting with `psql` locally

---

## Support

Stuck? Check these resources:
- 📖 [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- 📖 [Render Docs](https://render.com/docs)
- 📖 [Vercel Docs](https://vercel.com/docs)
- 💬 [Discord Community](YOUR_DISCORD_LINK)
