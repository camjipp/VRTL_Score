import { NextResponse } from "next/server";

import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function GET(req: Request) {
  // Protected test endpoint: only enabled when SENTRY_TEST_TOKEN is set.
  const expected = process.env.SENTRY_TEST_TOKEN;
  const token = bearerToken(req);
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  Sentry.captureException(new Error("Sentry server test error"));
  Sentry.captureMessage("Sentry server test message", "info");

  return NextResponse.json({ ok: true });
}


