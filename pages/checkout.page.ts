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
    const paid = this.page.waitForResponse("**/api/payment");
    await this.payNowButton.click();
    await paid;
    await this.page.waitForTimeout(2000); // give the gateway a moment
  }

  async paymentStatusText() {
    return this.paymentStatus.textContent();
  }
}
