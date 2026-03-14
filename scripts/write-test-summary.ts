#!/usr/bin/env tsx
// Reads Vitest and Playwright JSON result files and writes a unified summary
// to test-results/summary.json. Run after test commands.
//
// Usage: tsx scripts/write-test-summary.ts

import { readFileSync, writeFileSync, existsSync } from "fs";

interface VitestResults {
  numTotalTests?: number;
  numPassedTests?: number;
  numFailedTests?: number;
  numPendingTests?: number;
  success?: boolean;
  testResults?: Array<{ status: string }>;
}

interface PlaywrightResults {
  stats?: {
    expected?: number;
    unexpected?: number;
    flaky?: number;
    skipped?: number;
    ok?: boolean;
  };
  suites?: unknown[];
}

interface TestSummary {
  generatedAt: string;
  vitest: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passed_overall: boolean;
    available: boolean;
  };
  e2e: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passed_overall: boolean;
    available: boolean;
  };
  overall_passed: boolean;
}

function readJson<T>(path: string): T | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function parseVitest(data: VitestResults | null): TestSummary["vitest"] {
  if (!data) {
    return { total: 0, passed: 0, failed: 0, skipped: 0, passed_overall: false, available: false };
  }
  const total = data.numTotalTests ?? 0;
  const passed = data.numPassedTests ?? 0;
  const failed = data.numFailedTests ?? 0;
  const skipped = data.numPendingTests ?? 0;
  return {
    total,
    passed,
    failed,
    skipped,
    passed_overall: (data.success ?? false) && failed === 0,
    available: true,
  };
}

function parsePlaywright(data: PlaywrightResults | null): TestSummary["e2e"] {
  if (!data?.stats) {
    return { total: 0, passed: 0, failed: 0, skipped: 0, passed_overall: false, available: false };
  }
  const s = data.stats;
  const passed = s.expected ?? 0;
  const failed = (s.unexpected ?? 0) + (s.flaky ?? 0);
  const skipped = s.skipped ?? 0;
  const total = passed + failed + skipped;
  return {
    total,
    passed,
    failed,
    skipped,
    passed_overall: (s.ok ?? (failed === 0 && total > 0)) && failed === 0,
    available: true,
  };
}

const vitest = parseVitest(readJson<VitestResults>("test-results/vitest-results.json"));
const e2e = parsePlaywright(readJson<PlaywrightResults>("test-results/playwright-results.json"));

const summary: TestSummary = {
  generatedAt: new Date().toISOString(),
  vitest,
  e2e,
  overall_passed: vitest.passed_overall && (e2e.available ? e2e.passed_overall : true),
};

writeFileSync("test-results/summary.json", JSON.stringify(summary, null, 2));
console.log("✓ test-results/summary.json written");
console.log(`  Vitest:  ${vitest.passed}/${vitest.total} passed, ${vitest.failed} failed`);
console.log(`  E2E:     ${e2e.passed}/${e2e.total} passed, ${e2e.failed} failed`);
console.log(`  Overall: ${summary.overall_passed ? "PASS" : "FAIL"}`);
