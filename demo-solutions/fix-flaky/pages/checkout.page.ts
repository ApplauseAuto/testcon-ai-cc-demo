import { type Locator, type Page } from "@playwright/test";

export class CheckoutPage {
  readonly cartTotal: Locator;
  readonly payNowButton: Locator;
  readonly paymentStatus: Locator;
  readonly paymentConfirmed: Locator;

  constructor(private readonly page: Page) {
    this.cartTotal = page.getByTestId("cart-total");
    this.payNowButton = page.getByRole("button", { name: "Pay now" });
    this.paymentStatus = page.getByTestId("payment-status");
    this.paymentConfirmed = page.getByTestId("payment-confirmed");
  }

  async open() {
    await this.page.goto("/checkout.html");
  }

  async pay() {
    // POST /api/payment only accepts the charge (202 pending); wait for the
    // status poll that reports it confirmed.
    const confirmed = this.page.waitForResponse(
      async (res) =>
        /\/api\/payment\/[^/]+\/status$/.test(res.url()) &&
        (await res.json()).status === "confirmed",
    );
    await this.payNowButton.click();
    await confirmed;
  }
}
