import { test, expect } from "@playwright/test";
import { CheckoutPage } from "../pages/checkout.page";
import { checkoutTexts } from "../test-data/checkout";

test("cart shows the total before paying", async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.open();

  await expect(checkout.cartTotal).toHaveText(checkoutTexts.cartTotal);
});
