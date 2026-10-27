import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Load .env.local the same way Next.js does, so the test can read the Clerk keys and the
// test users' credentials from process.env. (Values are never printed or committed.)
loadEnvConfig(process.cwd());

// Set PLAYWRIGHT_BASE_URL (e.g. https://dbs-p4.vercel.app) to test a deployed site instead of localhost.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global.setup.ts",
  timeout: 90_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    timezoneId: "America/Chicago", // so "which day" is the same every run
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Locally: use the dev server if it's already running, otherwise start one.
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
