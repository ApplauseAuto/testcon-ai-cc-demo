# Payment Gateway Runbook

## Confirmation time

The gateway confirms a charge asynchronously. Confirmation time varies per payment:
usually 1–3 seconds, and up to 8 seconds at peak hours. This is normal behaviour,
not an outage. The checkout page shows "Processing payment…" until the status
endpoint returns `confirmed`, then "Done." and "Payment confirmed".

## Testing checkout: recommended pattern

- The `202` from `POST /api/payment` means "accepted", not "paid".
- Wait for the explicit confirmation event: the `GET /api/payment/{id}/status`
  response with `status: "confirmed"`, or a retrying assertion on the confirmation UI.
- Never sleep a fixed time and then read the UI once. Whatever the number, a slower
  payment will beat it.
- If a retry is needed, retry the confirmation check, not the whole checkout flow —
  resubmitting payment can double-charge in some gateway configurations.

## Related

A checkout test that fails right after "Pay now" while the page still says
"Processing payment…" is almost always a test that checked too early, not an app bug.
