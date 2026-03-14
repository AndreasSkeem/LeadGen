// Per-test-file setup — runs before each test file in its worker.
// DATABASE_URL is already set via vitest.config.ts test.env,
// so the Prisma singleton will point to test.db when imported.
//
// Nothing else needed here — cleanup is done per integration test file.
