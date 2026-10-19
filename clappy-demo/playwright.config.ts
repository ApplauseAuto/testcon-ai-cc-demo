import { defineConfig } from "@playwright/test";

// The three tests Anna, Ben and Chris wrote, each on their own, against
// Sauce Labs' public demo shop. They are the input for the Clappy demo.
export default defineConfig({
  testDir: "./flows",
  timeout: 30000,
  reporter: [["list"]],
  use: { baseURL: "https://www.saucedemo.com", headless: true },
});
