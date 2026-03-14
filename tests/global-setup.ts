// Global test setup — runs once before any tests, in the main Vitest process.
// Migrates the test.db database so integration tests have a correct schema.
// Does NOT seed providers here — integration tests seed their own minimal data.

import { execSync } from "child_process";
import { mkdirSync } from "fs";

export function setup() {
  // Ensure test-results directory exists
  mkdirSync("test-results", { recursive: true });

  // Apply all pending Prisma migrations to the test database.
  // The test DB is separate from dev.db — no overlap.
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "pipe",
  });
}

export function teardown() {
  // Nothing to do — test.db file persists between runs and is cleaned per-test.
}
