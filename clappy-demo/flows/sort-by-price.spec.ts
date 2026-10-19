import { test, expect } from "@playwright/test";

// Ben: sorting by price puts the cheapest product first.
test("sorting by price low to high starts at $7.99", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.getByRole("button", { name: "Login" }).click();
  await page.locator('[data-test="product-sort-container"]').selectOption("lohi");
  await expect(page.locator('[data-test="inventory-item-price"]').first()).toHaveText("$7.99");
});
