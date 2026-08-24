# AI Lead Qualifier v2.0 🚀

**Production-ready enterprise lead qualification platform. Full source code.**

> I built this. I'm selling it. You keep 100% of what you charge your clients.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## What's Fixed (Critical Bugs from v1)

1. **routing.js** — Removed invalid Prisma syntax. Now uses JS filtering for rep load balancing.
2. **email.js** — Fixed transporter typo. Added SMTP verification on startup.
3. **database.js** — Uses Prisma 5 `$use` middleware for query logging.
4. **crmSync.js** — OAuth 2.0 Web Server flow + refresh token caching (no passwords).
5. **alerting.js** — Redis persistence for anomaly detection (survives restarts).
6. **aiScoring.js** — Redis sliding-window rate limiting (100 req/hour/tenant).
7. **app.js** — CORS with credentials support for production auth.
8. **encryption.js** — AES-256-GCM with documented key requirements.

---

## What's New (Production Infrastructure)

- **Stripe Billing** — Full subscription lifecycle (checkout, portal, webhooks, tiered plans)
- **White-Label / Branding** — Per-tenant custom domains, colors, logos, email sender names
- **Multi-Tenant Isolation** — Strict middleware verifying every DB query is scoped to the requesting tenant
- **GDPR / CCPA Compliance** — Cookie consent tracking, full data export (JSON), right-to-erasure
- **Email Verification** — Token-based verification on signup with resend capability
- **Password Reset** — Secure token-based forgot-password flow
- **Lead Decay Scoring** — Time-based score degradation for stale leads with re-engagement detection
- **API Routes** — Full REST API with auth, leads, settings, sequences, reports, billing
- **Validation Middleware** — Express-validator on all endpoints
- **Error Handling** — Centralized handler with Prisma & JWT error mapping
- **JWT Auth + RBAC** — Owner/Admin/Manager/Sales/Viewer roles

---

## Quick Start

```bash
# 1. Start infrastructure
docker-compose up -d postgres redis

# 2. Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# 3. Login
demo@example.com / demo123456
```

See [QUICKSTART.md](./QUICKSTART.md) for full deployment guides (Render, Docker, local).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your keys. **Critical:** Set strong `JWT_SECRET` and `ENCRYPTION_KEY` values.

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/leads
POST   /api/leads
GET    /api/leads/:id
PATCH  /api/leads/:id/status
GET    /api/leads/analytics/dashboard
POST   /api/leads/decay/apply
POST   /api/leads/:id/activity

GET    /api/sequences
POST   /api/sequences
POST   /api/sequences/:id/enroll

GET    /api/settings/team
PATCH  /api/settings/team/settings
POST   /api/settings/team/invite
PATCH  /api/settings/team/white-label

GET    /api/reports/forecast
GET    /api/reports/pipeline

POST   /api/billing/checkout
GET    /api/billing/portal
POST   /api/billing/webhook
GET    /api/billing/plans

POST   /api/gdpr/export
DELETE /api/gdpr/erase
POST   /api/gdpr/consent
GET    /api/gdpr/consent/:visitorId
```

---

## Pricing

| License | Price | Rights |
|---------|-------|--------|
| Solo | $499 | Single tenant, personal use |
| Agency | $999 | Multi-tenant, white-label, unlimited clients |

Founder price. Doubles soon.

---

## License

MIT — See `QUICKSTART.md` for resale rights by tier.
