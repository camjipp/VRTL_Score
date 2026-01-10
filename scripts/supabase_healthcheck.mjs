import fs from "node:fs";
import process from "node:process";

import dotenv from "dotenv";

// Auto-load local env files for convenience when running the checker.
// This does NOT modify the database; it only reads environment variables.
if (fs.existsSync(".env.local")) dotenv.config({ path: ".env.local" });
else if (fs.existsSync(".env")) dotenv.config({ path: ".env" });

const REQUIRED_TABLES = [
  "agencies",
  "agency_users",
  "clients",
  "competitors",
  "snapshots",
  "responses",
  "reports"
];

function ok(msg) {
  console.log(`PASS ${msg}`);
}

function fail(msg) {
  console.log(`FAIL ${msg}`);
}

function heading(msg) {
  console.log(`\n== ${msg} ==`);
}

function env(name) {
  return process.env[name]?.trim();
}

async function runPostgresChecks(databaseUrl) {
  const { Client } = await import("pg");

  const client = new Client({
    connectionString: databaseUrl,
    // Supabase Postgres requires SSL; verify certs by default.
    ssl: { rejectUnauthorized: true }
  });

  await client.connect();
  try {
    heading("Connection");
    ok("Connected to Postgres via DATABASE_URL");

    // A) tables exist
    heading("A) Required tables exist (public schema)");
    {
      const res = await client.query(
        `
        select tablename
        from pg_catalog.pg_tables
        where schemaname = 'public'
          and tablename = any($1::text[])
        `,
        [REQUIRED_TABLES]
      );
      const found = new Set(res.rows.map((r) => r.tablename));
      const missing = REQUIRED_TABLES.filter((t) => !found.has(t));
      if (missing.length === 0) ok(`All tables present: ${REQUIRED_TABLES.join(", ")}`);
      else fail(`Missing tables: ${missing.join(", ")}`);
    }

    // B) RLS enabled
    heading("B) RLS enabled on each required table");
    {
      const res = await client.query(
        `
        select c.relname as tablename, c.relrowsecurity as rls_enabled
        from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relkind = 'r'
          and c.relname = any($1::text[])
        `,
        [REQUIRED_TABLES]
      );
      const byName = new Map(res.rows.map((r) => [r.tablename, r.rls_enabled]));
      const missing = REQUIRED_TABLES.filter((t) => !byName.has(t));
      if (missing.length) fail(`Missing relations (cannot check RLS): ${missing.join(", ")}`);
      const disabled = REQUIRED_TABLES.filter((t) => byName.get(t) === false);
      if (disabled.length === 0) ok("RLS enabled for all required tables");
      else fail(`RLS disabled for: ${disabled.join(", ")}`);
    }

    // C) policies exist
    heading("C) Policies exist on each required table (policy names per table)");
    {
      const res = await client.query(
        `
        select
          c.relname as tablename,
          p.polname as policy_name
        from pg_catalog.pg_policy p
        join pg_catalog.pg_class c on c.oid = p.polrelid
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = any($1::text[])
        order by c.relname asc, p.polname asc
        `,
        [REQUIRED_TABLES]
      );

      const policiesByTable = new Map();
      for (const row of res.rows) {
        const list = policiesByTable.get(row.tablename) ?? [];
        list.push(row.policy_name);
        policiesByTable.set(row.tablename, list);
      }

      let anyMissing = false;
      for (const table of REQUIRED_TABLES) {
        const policies = policiesByTable.get(table) ?? [];
        if (policies.length === 0) {
          anyMissing = true;
          fail(`${table}: no policies found`);
        } else {
          ok(`${table}: ${policies.join(", ")}`);
        }
      }
      if (!anyMissing) ok("At least one policy exists for each required table");
    }

    // D) function exists
    heading("D) public.current_agency_id() function exists");
    {
      const res = await client.query(
        `
        select p.proname
        from pg_catalog.pg_proc p
        join pg_catalog.pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
          and p.proname = 'current_agency_id'
        limit 1
        `
      );
      if (res.rowCount === 1) ok("Function exists: public.current_agency_id()");
      else fail("Missing function: public.current_agency_id()");
    }

    // E) enum exists
    heading("E) snapshot_status enum exists");
    {
      const res = await client.query(
        `
        select t.typname
        from pg_catalog.pg_type t
        join pg_catalog.pg_namespace n on n.oid = t.typnamespace
        where n.nspname = 'public'
          and t.typtype = 'e'
          and t.typname = 'snapshot_status'
        limit 1
        `
      );
      if (res.rowCount === 1) ok("Enum exists: public.snapshot_status");
      else fail("Missing enum: public.snapshot_status");
    }
  } finally {
    await client.end();
  }
}

async function runServiceRoleFallbackChecks(projectUrl, serviceRoleKey) {
  heading("Connection (fallback)");
  ok("DATABASE_URL not set; using SUPABASE_SERVICE_ROLE_KEY + project URL (limited checks)");

  // NOTE: PostgREST cannot query pg_catalog for RLS/policy/function/enum details.
  // We can only do basic table-level probes here.
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(projectUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  heading("A) Required tables respond (basic probe)");
  for (const table of REQUIRED_TABLES) {
    const { error } = await supabase.from(table).select("*").limit(1);
    if (error) fail(`${table}: ${error.message}`);
    else ok(`${table}: readable`);
  }

  heading("B–E) Catalog checks");
  fail("RLS enabled check requires DATABASE_URL (pg_catalog not accessible via PostgREST)");
  fail("Policy listing requires DATABASE_URL (pg_policy not accessible via PostgREST)");
  fail("Function existence check requires DATABASE_URL (pg_proc not accessible via PostgREST)");
  fail("Enum existence check requires DATABASE_URL (pg_type not accessible via PostgREST)");
}

async function main() {
  const databaseUrl = env("DATABASE_URL");
  if (databaseUrl) {
    await runPostgresChecks(databaseUrl);
    return;
  }

  const projectUrl =
    env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL") || env("SUPABASE_PROJECT_URL");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");

  if (!projectUrl || !serviceRoleKey) {
    heading("Configuration");
    fail("Missing DATABASE_URL.");
    fail(
      "Set DATABASE_URL for full checks, or set SUPABASE_SERVICE_ROLE_KEY + SUPABASE_URL for limited probes."
    );
    process.exitCode = 1;
    return;
  }

  await runServiceRoleFallbackChecks(projectUrl, serviceRoleKey);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


