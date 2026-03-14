import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    // forks pool: each test file gets a fresh Node.js process.
    // This ensures the Prisma singleton reads DATABASE_URL correctly per test run.
    pool: "forks",
    // Serialize test files to prevent concurrent SQLite writes on test.db
    fileParallelism: false,
    env: {
      // Tests use an isolated SQLite file, separate from dev.db
      DATABASE_URL: "file:./test.db",
      // Suppress OpenRouter AI calls in tests (build-brief falls back to deterministic summary)
      API_KEY_OPENROUTER: "",
    },
    globalSetup: "./tests/global-setup.ts",
    setupFiles: ["./tests/setup.ts"],
    reporters: ["default", "json", "junit"],
    outputFile: {
      json: "./test-results/vitest-results.json",
      junit: "./test-results/junit.xml",
    },
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.ts",
    ],
    // Separate coverage directory from test artifacts
    coverage: {
      provider: "v8",
      reportsDirectory: "./test-results/coverage",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/ai/**", "src/generated/**"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
