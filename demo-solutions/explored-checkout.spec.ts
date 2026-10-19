import { test, expect } from "@playwright/test";

// Written from a live exploration of /checkout.html via the Playwright MCP:
//   1. Cart shows Running shoes $64.00 + Socks (3-pack) $20.00, total $84.00.
//   2. "Pay now" -> status "Processing payment…", POST /api/payment -> 202.
//   3. Page polls GET /api/payment/{id}/status every 500ms (~6 polls, ~3s).
//   4. On "confirmed": status "Done." and a "Payment confirmed" banner.
//
// Per corpus/payment-api-spec.md and payment-gateway-runbook.md, confirmation
// is asynchronous: we wait for the status response that says "confirmed"
// instead of asserting right after the click or relying on a fixed timeout.
test("checkout: pay now goes pending -> confirmed", async ({ page }) => {
  await page.goto("/checkout.html");

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByTestId("cart-total")).toHaveText("$84.00");

  const paymentCreated = page.waitForResponse(
    (r) => r.url().endsWith("/api/payment") && r.request().method() === "POST",
  );
  const paymentConfirmed = page.waitForResponse(async (r) => {
    if (!/\/api\/payment\/[^/]+\/status$/.test(r.url())) return false;
    const body = await r.json();
    return body.status === "confirmed";
  });

  await page.getByRole("button", { name: "Pay now" }).click();

  const created = await paymentCreated;
  expect(created.status()).toBe(202);
  const { paymentId } = await created.json();
  expect(paymentId).toBeTruthy();

  await expect(page.getByTestId("payment-status")).toHaveText("Processing payment…");

  const confirmed = await paymentConfirmed;
  expect(await confirmed.json()).toMatchObject({ paymentId, status: "confirmed" });

  await expect(page.getByTestId("payment-status")).toHaveText("Done.");
  await expect(page.getByTestId("payment-confirmed")).toHaveText("Payment confirmed");
});
