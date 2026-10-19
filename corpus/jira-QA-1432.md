# Jira ticket

## Summary

QA-1432 — checkout.spec.ts is flaky in CI. Type: Bug (test). Component: checkout-tests.
Status: Open. The test "checkout completes and shows the confirmed total" fails in roughly
4 of 10 CI runs and passes on re-run. Manual checkout always works; the app logs show no errors.

## History

- 18 Sep: CI retries set to 2. The pipeline goes green more often, but each failing run costs 6 extra minutes.
- 25 Sep: the fixed wait in the test was raised from 1000ms to 2000ms. Fewer failures, not zero.
- 03 Oct: failing again during peak hours, when the payment gateway is slower.

## Comments

"Should we just make the wait 5 seconds?" — no answer yet. Nobody has looked at
what the test actually waits for.
