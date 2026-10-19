# Team Test Automation Conventions

## Locators

Prefer role-based locators (`getByRole`) and `data-testid` attributes. Never use
CSS classes or XPath tied to layout — they break on every redesign.

## Waiting

No hard-coded sleeps (`waitForTimeout`). Wait for a specific condition: an element
becoming visible, a network response, or network-idle. Raising a timeout is not a
fix for a flaky test; find the event you should be waiting for.

## Assertions

Use web-first assertions (`await expect(locator).toHaveText(...)`): they retry until
the condition holds. Never read a value once (`textContent()`, `isVisible()`) and compare
it; that is a race with the app.

## Test structure

One user journey per test. Use `test.step` to name phases so reports read like
a story. Keep setup (logins, seeded carts) in fixtures, not copy-pasted per test.

## API vs UI

If a check does not need the browser, write it as an API test with the `request`
fixture. API tests are 10x faster and far less flaky than UI tests.

## Reviews

Every AI-generated test is reviewed by a human before merge, the same as any
other code. Generated code that cannot be explained by its author is rejected.
