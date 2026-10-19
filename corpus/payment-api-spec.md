# Payment API Specification

## POST /api/payment

Submits a charge for the current cart. Request body: `{ "cartId": string, "amount": number }`.
Returns `202 Accepted` with `{ "paymentId": string, "status": "pending" }`.
The charge is NOT confirmed in this response — confirmation is asynchronous.

## GET /api/payment/{paymentId}/status

Returns the current state of a payment: `{ "paymentId": string, "status": "pending" | "confirmed" | "declined" }`.
Clients must poll this endpoint until the status leaves `pending`. Confirmation
usually takes 1–3 seconds, up to 8 seconds at peak. Recommended polling: every 500ms, give up after 10s.

## Error responses

`400` when the amount is zero or negative, with `{ "error": "INVALID_AMOUNT" }`.
`404` when the paymentId is unknown, with `{ "error": "PAYMENT_NOT_FOUND" }`.

## Testing the payment API

API tests should use Playwright's `request` fixture rather than driving the UI.
Assert on the `202` from POST, then poll the status endpoint with `expect.poll`
until it becomes `confirmed`. Never assert `confirmed` directly on the POST response.
