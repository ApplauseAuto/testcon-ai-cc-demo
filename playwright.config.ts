import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: process.env.TEST_DIR || "./tests",
  timeout: 20000,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    headless: !process.env.HEADED,
  },
  webServer: {
    command: "node site/server.js",
    url: "http://localhost:4173",
    reuseExistingServer: true,
  },
});
