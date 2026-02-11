# VRTL Score — Launch Checklist

Pre-launch checklist to get AI APIs, Stripe, and production config ready.

---

## 1. AI APIs Setup

### Required (minimum)
- **OPENAI_API_KEY** — Required for snapshots to run. Get from [platform.openai.com](https://platform.openai.com/api-keys).

### Optional (recommended for redundancy)
- **ANTHROPIC_API_KEY** — [console.anthropic.com](https://console.anthropic.com)
- **GEMINI_API_KEY** — [aistudio.google.com](https://aistudio.google.com/apikey) (Google AI Studio)

Snapshots run prompts across all enabled providers. At least one provider must be configured.

| Env var | Required | Default model |
|---------|----------|---------------|
| OPENAI_API_KEY | Yes (min) | gpt-4o-mini |
| ANTHROPIC_API_KEY | No | claude-3-5-sonnet-20241022 |
| GEMINI_API_KEY | No | gemini-1.5-flash |

---

## 2. Stripe Setup & Verification

### A. Create Stripe Account & Get Keys
1. [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys
2. **Test mode** (for local): Use `sk_test_...` and `pk_test_...`
3. **Production**: Switch to Live mode, use `sk_live_...` and `pk_live_...`

Add to `.env.local` (and Vercel env for production):
```
STRIPE_SECRET_KEY=sk_test_xxx   # or sk_live_xxx for prod
STRIPE_WEBHOOK_SECRET=whsec_xxx # from webhook setup below
```

### B. Set Up Webhook Endpoint

**Local testing (Stripe CLI):**
```bash
# Install: brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret (whsec_...) to STRIPE_WEBHOOK_SECRET
```

**Production (Vercel):**
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed` (optional, for logging)
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET` in Vercel

### C. Enable Billing
```
BILLING_ENABLED=true
```

### D. Verify Stripe Locally
1. Run `pnpm dev`
2. In another terminal: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copy `whsec_...` into `.env.local` as `STRIPE_WEBHOOK_SECRET`
4. Sign up → onboarding → pricing → choose plan → use test card `4242 4242 4242 4242`
5. Confirm redirect to `/app?checkout=success`
6. Check Stripe Dashboard → Customers, Subscriptions
7. Check Supabase `agencies` table: `is_active=true`, `plan` set, `stripe_subscription_id` populated

### E. Database Requirements
Ensure `agencies` has these columns (add via Supabase SQL if missing):
- `stripe_customer_id` (text, nullable)
- `stripe_subscription_id` (text, nullable)
- `plan` (text, e.g. starter/growth/pro)
- `is_active` (boolean, default false)

---

## 3. Going Live (Production)

### Vercel env vars (Production + Preview)
```
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (at least OpenAI)
OPENAI_API_KEY=
# Optional:
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Billing
BILLING_ENABLED=true
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Admin (comma-separated emails)
ADMIN_EMAILS=you@example.com

# Optional
OPENAI_MODEL=
AGENCY_LOGO_BUCKET=agency-logos
PDF_HEALTH_TOKEN=
```

### Supabase config
- **Authentication** → URL Configuration:
  - Site URL: `https://your-domain.com`
  - Redirect URLs: add `https://your-domain.com/**` and `https://*.vercel.app/**`

### Stripe production
- Switch to Live mode in Stripe Dashboard
- Use live keys in Vercel
- Create production webhook pointing to `https://your-domain.com/api/stripe/webhook`
- Test a real checkout with a real card (then refund if needed)

---

## 4. Quick Verification Commands

```bash
# Check env is loaded
node -e "require('dotenv').config({path:'.env.local'}); console.log('OPENAI:', !!process.env.OPENAI_API_KEY, 'STRIPE:', !!process.env.STRIPE_SECRET_KEY)"

# DB healthcheck (needs DATABASE_URL or SUPABASE_*)
pnpm db:check
```

---

## 5. Common Issues

| Issue | Fix |
|-------|-----|
| "Missing STRIPE_SECRET_KEY" | Add to .env.local / Vercel |
| Webhook "Invalid signature" | Wrong STRIPE_WEBHOOK_SECRET or using parsed body instead of raw |
| "No agency found" (checkout) | User must complete onboarding first |
| Agencies stuck `is_active=false` | Webhook not receiving events; check Stripe webhook logs |
| Snapshots fail with 500 | At least one of OPENAI/ANTHROPIC/GEMINI must be set |

---

## Summary

1. **AI**: Add `OPENAI_API_KEY` (required). Add `ANTHROPIC_API_KEY` + `GEMINI_API_KEY` for redundancy.
2. **Stripe**: Add `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`, set `BILLING_ENABLED=true`, run webhook locally with Stripe CLI or configure production endpoint.
3. **Production**: Deploy to Vercel, set all env vars, configure Supabase redirect URLs and Stripe production webhook.
