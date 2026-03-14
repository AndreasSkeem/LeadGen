// GET /api/admin/test-status
// Dev-only endpoint that reads the latest test summary artifact.
// Returns 404 if no summary has been generated yet.
// Returns 403 in production.
//
// Generate summary by running: npm run test:summary

import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const summaryPath = join(process.cwd(), "test-results", "summary.json");

  if (!existsSync(summaryPath)) {
    return NextResponse.json(
      {
        error: "No test summary found. Run: npm run test:summary",
        hint: "Run tests first with: npm run test:all",
      },
      { status: 404 }
    );
  }

  try {
    const raw = readFileSync(summaryPath, "utf8");
    const summary = JSON.parse(raw) as unknown;
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "Could not parse test summary" }, { status: 500 });
  }
}
