# Quick Start — AI Lead Qualifier v2.0

Complete white-label AI lead qualification platform. Full source code.

---

## What's Inside

- **AI Lead Scoring** — GPT-4o powered analysis with sentiment, intent, budget, pain, authority, timing breakdowns
- **Auto-Enrichment** — Clearbit, Hunter, Proxycurl integration
- **Smart Routing** — Load-balanced, territory-aware lead assignment
- **Hot Lead Alerts** — Slack, Discord, Email notifications
- **CRM Sync** — HubSpot & Salesforce native integrations
- **Stripe Billing** — Full subscription lifecycle (Starter $49/mo, Pro $149/mo, Enterprise custom)
- **Multi-Tenant** — Strict isolation, white-label domains, custom branding
- **GDPR/CCPA** — Cookie consent, data export, right-to-erasure
- **Lead Decay** — Time-based score degradation + re-engagement detection
- **Sequences** — Automated email/task sequences with enrollment triggers

---

## Local Development (5 minutes)

### 1. Start Infrastructure
```bash
docker-compose up -d postgres redis
```

### 2. Install & Setup
```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env — at minimum set:
# - DATABASE_URL
# - JWT_SECRET (64+ chars)
# - ENCRYPTION_KEY (32-byte hex)
# - OPENAI_API_KEY
```

### 4. Run
```bash
npm run dev
```

### 5. Login
```
URL:     http://localhost:4000
Email:   demo@example.com
Password: demo123456
```

---

## Production Deploy (Render.com)

1. **Create Web Service** on [render.com](https://render.com)
2. **Build Command**:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
3. **Start Command**:
   ```bash
   npm start
   ```
4. **Environment**: `NODE_VERSION` = `20.x`
5. Add **PostgreSQL** managed database
6. Add **Redis** managed instance (or use Upstash)
7. Copy all env vars from `.env.example` into Render dashboard

**Health Check**: `GET /health` returns `{ "status": "ok", "database": true }`

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account + tenant |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/verify-email` | Verify email token |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password` | Reset with token |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (paginated, filterable) |
| POST | `/api/leads` | Create lead (auto-enriched + AI scored) |
| GET | `/api/leads/:id` | Lead detail with messages & events |
| PATCH | `/api/leads/:id/status` | Update status |
| GET | `/api/leads/analytics/dashboard` | Dashboard stats |
| POST | `/api/leads/decay/apply` | Run decay scoring |
| POST | `/api/leads/:id/activity` | Record activity (resets decay) |

### Sequences
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sequences` | List sequences |
| POST | `/api/sequences` | Create sequence |
| POST | `/api/sequences/:id/enroll` | Enroll leads |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing/plans` | Available plans |
| POST | `/api/billing/checkout` | Stripe checkout session |
| GET | `/api/billing/portal` | Customer portal |
| POST | `/api/billing/webhook` | Stripe webhooks |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/team` | Team & integrations |
| PATCH | `/api/settings/team/settings` | Update tenant settings |
| POST | `/api/settings/team/invite` | Invite team member |
| PATCH | `/api/settings/team/white-label` | Update branding |

### GDPR
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gdpr/export` | Export user data (JSON) |
| DELETE | `/api/gdpr/erase` | Right-to-erasure |
| POST | `/api/gdpr/consent` | Record cookie consent |
| GET | `/api/gdpr/consent/:visitorId` | Get consent status |

---

## Folder Structure

Organize your files like this before deploying:

```
ai-lead-qualifier/
├── src/
│   ├── app.js                    # Express entry point
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── leads.js
│   │   │   ├── sequences.js
│   │   │   ├── settings.js
│   │   │   ├── reports.js
│   │   │   ├── billing.js
│   │   │   └── gdpr.js
│   │   └── middleware/
│   │       ├── errorHandler.js
│   │       ├── tenantIsolation.js
│   │       ├── whiteLabel.js
│   │       └── validation.js
│   ├── services/
│   │   ├── aiScoring.js
│   │   ├── enrichment.js
│   │   ├── routing.js
│   │   ├── alerting.js
│   │   ├── crmSync.js
│   │   ├── leadDecay.js
│   │   ├── email.js
│   │   └── gdpr.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── encryption.js
│   │   ├── sanitizer.js
│   │   ├── circuitBreaker.js
│   │   └── validationRules.js
│   └── config/
│       └── database.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
└── QUICKSTART.md
```

---

## White-Label Setup

1. Go to **Settings → White Label**
2. Upload logo, set primary color hex code
3. Add custom domain (set CNAME to your server IP)
4. Configure sender name for transactional emails
5. Toggle **Enabled**

---

## CRM Integration

### HubSpot
1. Settings → Integrations → Add HubSpot
2. Paste your HubSpot Private App token
3. Leads auto-sync on creation

### Salesforce
1. Settings → Integrations → Connect Salesforce
2. Complete OAuth flow
3. Leads auto-sync with proper status mapping

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `PrismaClientInitializationError` | Run `npx prisma generate` |
| `Database connection lost` | Check `DATABASE_URL` and ensure Postgres is running |
| `Redis connection error` | Check `REDIS_HOST` / `REDIS_PORT` |
| `Stripe webhook fails` | Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard |
| `AI scoring returns fallback` | Check `OPENAI_API_KEY` and rate limit status |

---

## License

MIT — Resell, rebrand, deploy for unlimited clients under Agency License.
