import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";
const readinessURL = `${baseURL}/favicon.ico`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    reuseExistingServer: false,
    url: readinessURL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
