import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // Sequential for dev simplicity
  retries: 1,
  workers: 1,
  outputDir: "./test-results/playwright-artifacts",
  reporter: [
    ["html", { outputFolder: "test-results/playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/playwright-results.json" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Start dev server pointing at the test DB so E2E tests don't pollute dev.db
    command: "cross-env DATABASE_URL=file:./test.db npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env["CI"],
    timeout: 60_000,
  },
});
