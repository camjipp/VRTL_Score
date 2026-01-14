import { NextResponse } from "next/server";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

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
  // Dev-only by default: only enabled when a token is configured.
  // If you do not set PDF_HEALTH_TOKEN, this endpoint returns 404 everywhere.
  const expected = process.env.PDF_HEALTH_TOKEN;
  const token = bearerToken(req);
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nextRuntime = process.env.NEXT_RUNTIME ?? null;
  if (nextRuntime === "edge") {
    return NextResponse.json(
      { error: "Chromium healthcheck must run in nodejs runtime", diagnostics: { nextRuntime } },
      { status: 500 }
    );
  }

  const headlessMode = "shell" as const;
  const startedAt = Date.now();
  let executablePath: string | null = null;
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    executablePath = await chromium.executablePath();
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: headlessMode
    });
    const page = await browser.newPage();
    await page.setContent("<html><body>ok</body></html>", { waitUntil: "load" });
    await page.close();

    return NextResponse.json({
      ok: true,
      duration_ms: Date.now() - startedAt,
      diagnostics: {
        nextRuntime,
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        executablePath,
        argsLength: chromium.args.length,
        headless: headlessMode
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: "Chromium healthcheck failed",
        message,
        diagnostics: {
          nextRuntime,
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          executablePath,
          argsLength: chromium.args.length,
          headless: headlessMode
        }
      },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}


