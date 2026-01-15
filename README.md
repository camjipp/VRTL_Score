# VRTLScore (v1 skeleton)

Internal agency web tool (diagnostic + measurement only).

## What’s included
- Next.js App Router + TypeScript
- Tailwind (minimal setup, no UI polish)
- Supabase client stub (no auth flow yet)
- Routes: `/login`, `/pricing`, `/app` (placeholders)

## Getting started
1. Copy env vars:
   - `cp env.example .env.local`
2. Install deps:
   - `pnpm install`
3. Run:
   - `pnpm dev`

## Local commands (pnpm via Corepack)
```bash
cd /Users/cameronjipp/VRTL_Score
corepack enable
corepack prepare pnpm@latest --activate
pnpm config set store-dir .pnpm-store
pnpm install
pnpm dev
```

## Fallback (if corepack prepare fails locally)
```bash
brew install pnpm
pnpm config set store-dir .pnpm-store
pnpm install
pnpm dev
```

## DB healthcheck (schema + RLS verification)
Run a read-only check to confirm your schema, RLS, policies, function, and enum exist.

**Preferred (full checks via Postgres):**
- Put `DATABASE_URL` in `.env.local` (from Supabase: Project Settings → Database → Connection string)

Then run:
```bash
pnpm db:check
```

**Fallback (limited checks via Supabase API):**
- Set `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- Set `SUPABASE_SERVICE_ROLE_KEY`

Then run:
```bash
pnpm db:check
```

## Vercel + Supabase settings (required)
**Vercel env vars (Preview + Production):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose to browser)
- `OPENAI_API_KEY` (server-only)

**Optional (recommended):**
- `OPENAI_MODEL`
- `SNAPSHOT_OPENAI_CONCURRENCY`
- `SNAPSHOT_OPENAI_RETRIES`
- `SNAPSHOT_STALE_RUNNING_MS`
- `SNAPSHOT_CLIENT_COOLDOWN_MS`
- `SNAPSHOT_DAILY_LIMIT`

**PDF branding (optional):**
- Create a Supabase Storage bucket named `agency-logos` (public recommended for v1) or set `AGENCY_LOGO_BUCKET`.
- Add `brand_logo_url` + `brand_accent` columns to `public.agencies` (SQL in chat history).

**Observability (optional):**
- `SENTRY_DSN` (server) and/or `NEXT_PUBLIC_SENTRY_DSN` (client)

**Supabase dashboard settings:**
- Authentication → URL Configuration
  - **Site URL**: set to your Production domain (e.g. `https://vrtlscore.vercel.app`)
  - **Redirect URLs**: add:
    - your Production domain (e.g. `https://vrtlscore.vercel.app/**`)
    - your Vercel Preview domains (e.g. `https://*.vercel.app/**`)

## Manual test plan (Vercel Preview URL)
1) Open Preview URL → go to `/login`.
2) Sign up with an email + password (or sign in if already created).
3) Confirm redirect to `/app` and you see “Clients”.
4) Click “New client” → create a client → you’re redirected to `/app/clients/[id]`.
5) Add competitors until you hit **8**; confirm the UI blocks adding a 9th and delete works.


