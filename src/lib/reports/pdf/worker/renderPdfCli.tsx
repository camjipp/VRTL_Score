/**
 * Invoked as: node dist/pdf-worker.cjs <path-to-payload.json>
 * Writes raw PDF bytes to stdout. Stderr on failure (exit ≠ 0).
 * Built by scripts/build-pdf-worker.mjs — not loaded through Next/webpack.
 */
import { readFileSync } from "node:fs";

import type { DocumentProps } from "@react-pdf/renderer";
import { Document, Page, renderToBuffer, Text } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import React from "react";

import { ReportDocument } from "../ReportDocument";
import type { ReportData } from "../types";

export type WorkerPayload =
  | { mode: "minimal" }
  | { mode: "full"; data: ReportData; pages?: number[] };

async function run(): Promise<void> {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("pdf-worker: missing JSON path argument");
    process.exit(1);
  }
  const payload = JSON.parse(readFileSync(jsonPath, "utf8")) as WorkerPayload;
  let buf: Buffer;
  if (payload.mode === "minimal") {
    buf = await renderToBuffer(
      React.createElement(
        Document,
        {},
        React.createElement(Page, { size: "A4" }, React.createElement(Text, {}, "test"))
      )
    );
  } else {
    buf = await renderToBuffer(
      React.createElement(ReportDocument, {
        data: payload.data,
        pages: payload.pages,
      }) as ReactElement<DocumentProps>
    );
  }
  process.stdout.write(buf);
}

run().catch((err: unknown) => {
  const e = err instanceof Error ? err : new Error(String(err));
  console.error(e.stack || e.message);
  process.exit(1);
});
