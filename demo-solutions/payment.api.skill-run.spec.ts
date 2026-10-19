import { test, expect } from "@playwright/test";

// Based on corpus/payment-api-spec.md (POST, status endpoint, error responses, testing section).

test("submitting a payment returns 202 with a pending paymentId", async ({ request }) => {
  const res = await request.post("/api/payment", { data: { cartId: "c1", amount: 42 } });

  expect(res.status()).toBe(202);
  const body = await res.json();
  expect(body.paymentId).toEqual(expect.any(String));
  expect(body.status).toBe("pending");
});

test("a submitted payment becomes confirmed asynchronously", async ({ request }) => {
  const res = await request.post("/api/payment", { data: { cartId: "c1", amount: 42 } });
  expect(res.status()).toBe(202);
  const { paymentId } = await res.json();

  await expect
    .poll(
      async () => (await (await request.get(`/api/payment/${paymentId}/status`)).json()).status,
      { intervals: [500], timeout: 10_000 },
    )
    .toBe("confirmed");
});

test("the status endpoint returns the paymentId it was asked about", async ({ request }) => {
  const { paymentId } = await (
    await request.post("/api/payment", { data: { cartId: "c1", amount: 42 } })
  ).json();

  const res = await request.get(`/api/payment/${paymentId}/status`);

  expect(res.status()).toBe(200);
  expect((await res.json()).paymentId).toBe(paymentId);
});

for (const amount of [0, -5]) {
  test(`a payment with amount ${amount} is rejected with 400 INVALID_AMOUNT`, async ({ request }) => {
    const res = await request.post("/api/payment", { data: { cartId: "c1", amount } });

    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({ error: "INVALID_AMOUNT" });
  });
}

test("status of an unknown paymentId is 404 PAYMENT_NOT_FOUND", async ({ request }) => {
  const res = await request.get("/api/payment/does-not-exist/status");

  expect(res.status()).toBe(404);
  expect(await res.json()).toEqual({ error: "PAYMENT_NOT_FOUND" });
});
