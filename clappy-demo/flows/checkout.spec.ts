import { test, expect } from "@playwright/test";

// Chris: the whole checkout, from login to the thank-you page.
test("checkout of one backpack completes", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.getByRole("button", { name: "Login" }).click();
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.getByPlaceholder("First Name").fill("Chris");
  await page.getByPlaceholder("Last Name").fill("Tester");
  await page.getByPlaceholder("Zip/Postal Code").fill("01001");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Finish" }).click();
  await expect(page.getByRole("heading", { name: "Thank you for your order!" })).toBeVisible();
});
