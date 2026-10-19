import { test, expect } from "@playwright/test";
import { CheckoutPage } from "../pages/checkout.page";
import { checkoutTexts } from "../test-data/checkout";

test("checkout completes and shows the confirmed total", async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.open();

  await checkout.pay();

  expect(await checkout.paymentStatusText()).toBe(checkoutTexts.paymentDone);
});
