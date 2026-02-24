# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

VRTLScore is a Next.js 15 (App Router) SaaS application for measuring AI visibility of brands across LLM answer engines (ChatGPT, Claude, Gemini). Single-package TypeScript codebase (not a monorepo).

### Dev commands

Standard commands are in `package.json` scripts:

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` (port 3000) |
| Lint | `pnpm lint` |
| Build | `pnpm build` |
| DB healthcheck | `pnpm db:check` |

### Environment variables

Copy `env.example` to `.env.local`. The dev server starts with placeholder Supabase values (`https://placeholder.supabase.co` / `placeholder-anon-key`); pages that don't call Supabase render normally. Set `BILLING_ENABLED=false` to skip Stripe requirements.

For full functionality (auth, data, snapshots), real Supabase credentials are needed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### Non-obvious caveats

- There are no automated test suites (no Jest/Vitest/Playwright). Validation is lint + build + manual testing.
- Lint produces warnings (unused vars, `<img>` instead of `next/image`) — these are pre-existing and not errors.
- The `/signup` route redirects to `/onboarding` (client-side redirect).
- `@sparticuz/chromium` (used for PDF generation) downloads a large Chromium binary on install; this is expected.
- `next lint` shows a deprecation notice about migrating to ESLint CLI — this is informational and does not affect functionality.
