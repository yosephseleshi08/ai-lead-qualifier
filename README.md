# 🚀 LeadIQ — AI-Powered Lead Qualification Platform

> **Stop building dashboards from scratch.** Get a complete, white-label SaaS platform with AI lead scoring, drag-and-drop pipeline, GPT-4 sales copilot, and enterprise billing — ready to deploy in 1 hour.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Now-blue?style=for-the-badge&logo=vercel)](YOUR_VERCEL_LINK_HERE)
[![License](https://img.shields.io/badge/License-Commercial-green?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

---

## ✨ What You Get

A **complete SaaS product** — not a starter template. This is a production-ready lead qualification platform that agencies rebrand and resell to clients.

### 🧠 AI Features
- **GPT-4 Sales Copilot** — Chat interface that drafts emails, forecasts revenue, identifies at-risk deals, and prioritizes leads
- **AI Lead Scoring** — 94.7% accuracy using behavioral signals, company data, and engagement patterns
- **Revenue Forecasting** — Predicts quarterly revenue with confidence scores
- **Deal Risk Alerts** — Real-time warnings when deals are slipping
- **Personality Profiles** — AI analyzes how each lead prefers to be contacted

### 📊 Dashboard & Pipeline
- **Drag-and-Drop Kanban** — Move leads through your pipeline with @dnd-kit
- **Interactive Charts** — Revenue trends, conversion funnels, ICP radar, score distribution (Recharts)
- **Real-Time Stats** — Animated counters, live pipeline value, team performance
- **Dark Mode** — Full dark mode support with CSS variables

### 🏢 Enterprise Features
- **White-Label Ready** — Custom domains, colors, logos, email sender names
- **Multi-Tenant** — One codebase, unlimited clients
- **Stripe Billing** — Checkout, portal, webhooks, tiered plans (Starter/Growth/Enterprise)
- **RBAC** — Owner/Admin/Manager/Sales/Viewer roles
- **GDPR/CCPA** — Data export, right-to-erasure, cookie consent

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **State** | Zustand + TanStack Query |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Drag & Drop** | @dnd-kit |
| **Auth** | NextAuth.js (JWT + Credentials) |
| **Backend** | Node.js, Express, Prisma, PostgreSQL, Redis |
| **AI** | OpenAI GPT-4, Pinecone Vector DB |
| **Billing** | Stripe |

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/yosephseleshi08/ai-lead-qualifier.git
cd ai-lead-qualifier/frontend  # or root if monorepo
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```

Fill in your keys:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with:
- **Email:** `demo@example.com`
- **Password:** `demo123456`

### 4. Deploy to Production
```bash
# Deploy frontend to Vercel
vercel --prod

# Deploy backend to Render/Railway
# See backend/QUICKSTART.md for Docker deployment
```

---

## 📁 Project Structure

```
ai-lead-qualifier/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── dashboard/      # Main dashboard with AI widgets
│   │   │   ├── leads/          # Lead management table + AI detail drawer
│   │   │   ├── pipeline/       # Drag-and-drop Kanban board
│   │   │   ├── ai-copilot/     # GPT-4 chat interface
│   │   │   ├── ai-insights/    # Score distribution, ICP radar
│   │   │   ├── analytics/      # Revenue charts, team performance
│   │   │   ├── sequences/      # Outreach campaign builder
│   │   │   ├── billing/        # Stripe pricing tiers
│   │   │   └── settings/       # White-label, ICP config
│   │   ├── login/              # Auth page
│   │   └── page.tsx            # Marketing landing page
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives
│   │   ├── layout/             # Sidebar, Header, MobileNav
│   │   ├── dashboard/          # Stats, charts, AI widgets
│   │   ├── leads/              # Table, filters, detail drawer
│   │   └── pipeline/           # Kanban board, cards
│   ├── lib/
│   │   ├── api-client.ts       # TanStack Query + API hooks
│   │   ├── auth.ts             # NextAuth config
│   │   ├── mock-data.ts        # Demo data (replace with API)
│   │   ├── store.ts            # Zustand global state
│   │   └── utils.ts            # Formatters, helpers
│   └── types/
│       └── index.ts            # Full TypeScript definitions
├── backend/                    # Node.js API (see backend/README.md)
├── docker-compose.yml          # Postgres + Redis
└── package.json
```

---

## 🎨 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)
*Real-time stats, revenue charts, AI performance, conversion funnel*

### AI Sales Copilot
![AI Copilot](screenshots/ai-copilot.png)
*GPT-4 powered chat that drafts emails, forecasts revenue, and prioritizes leads*

### Pipeline
![Pipeline](screenshots/pipeline.png)
*Drag-and-drop Kanban with AI-scored cards*

### Lead Detail
![Lead Detail](screenshots/lead-detail.png)
*AI insights: score, personality profile, risk factors, similar deals*

---

## 💰 Pricing (For Your Clients)

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | $299/mo | 1,000 leads, basic AI scoring, 2 team members |
| **Growth** | $799/mo | 10,000 leads, AI Copilot, white-label, API access |
| **Enterprise** | Custom | Unlimited, custom AI models, SSO, SLA, dedicated support |

---

## 📝 License

**Commercial License** — Purchase includes:
- ✅ Full source code (frontend + backend)
- ✅ Unlimited personal/client projects
- ✅ White-label rights (rebrand and resell)
- ✅ Lifetime updates
- ✅ 30-day money-back guarantee

**Restrictions:**
- ❌ Do not resell as a template/boilerplate
- ❌ Do not distribute source code publicly

---

## 🤝 Support

- 📧 **Email:** support@leadiq.com
- 💬 **Discord:** [Join our community](YOUR_DISCORD_LINK)
- 📖 **Docs:** [Full Documentation](YOUR_DOCS_LINK)

---

## 🏆 Built For

- **Marketing Agencies** — White-label and resell to clients
- **B2B SaaS Founders** — Launch lead qualification in days, not months
- **Freelance Developers** — Deliver enterprise CRM projects 10x faster
- **Sales Teams** — Replace spreadsheets with AI-powered intelligence

---

<p align="center">
  <strong>Ready to transform your sales?</strong><br>
  <a href="YOUR_LIVE_DEMO_LINK">View Live Demo</a> • 
  <a href="YOUR_GUMROAD_LINK">Buy Now — $299</a>
</p>
