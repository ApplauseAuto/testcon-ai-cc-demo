# Try the demos yourself

Everything below runs locally. Do the [quick start](../README.md#quick-start) first.

## 1. The flaky checkout test

The Demo Shop's payment is confirmed asynchronously: usually 1–3 seconds, up to 8 at peak
(see `corpus/payment-gateway-runbook.md`). The test's page object sleeps 2 seconds and the
test then reads the status once, so it fails about 4 times in 10:

```bash
npx playwright test tests/checkout.spec.ts --repeat-each=10
# some runs: Expected "Done."  Received "Processing payment…"
```

Pin the gateway delay with `PAYMENT_DELAY_MS=8000` to simulate a busy day.

## 2. Claude without your docs (slide 24)

```bash
npm run demo:no-context      # builds a copy with only the tests, page object and test data
```
Follow the printed commands, then type either prompt:

```
The checkout test in tests/checkout.spec.ts is flaky in CI. Fix it.
/karpathy-guidelines The checkout test in tests/checkout.spec.ts is flaky in CI. Fix it.
```

In our runs both made the same change (no sleep, Playwright's default 5 s retry), which fails
when payment takes 8 s. With the karpathy rules Claude also warned that it didn't know the CI
timings. Results vary from run to run. Our runs: [`demo-solutions/no-docs/`](../demo-solutions/no-docs/).
Stop the shop afterwards: `npm run demo:no-context -- stop`.

## 3. The team skill with your docs (slides 25–29)

In this repo (with `search_docs` and Playwright MCP approved):

```
/fix-flaky the checkout test
```

It reproduces the failure, watches the checkout in a real browser, searches the team docs,
fixes the page object (wait for the "confirmed" status reply instead of sleeping), keeps the
suite's style, and runs the test 10 times. Our run: 20/20, also at 8 s and 12 s, in
[`demo-solutions/fix-flaky/`](../demo-solutions/fix-flaky/) (code, Claude's report, every tool call).
`npm run reset` puts the flaky test back.

## 4. The knowledge map

```bash
npm run viewer      # http://localhost:5050
```
Click the presets: the ticket ID `QA-1432` is found only by exact words; "purchase test randomly
breaks on the build server" only by meaning. Details: [`RAG-SETUP.md`](RAG-SETUP.md).

## 5. Skills working together

```
/api-tests the payment API, and follow /karpathy-guidelines
```
Claude searches the API spec and the test conventions, writes API tests with the `request`
fixture (no browser), and names the spec section each test is based on. Our run:
`demo-solutions/payment.api.skill-run.spec.ts`.

## 6. A guardrail for everyone

Ask Claude to `rm -rf test-results/`: the hook in `.claude/settings.json` (`scripts/guard-rm.js`)
blocks it and explains why.
