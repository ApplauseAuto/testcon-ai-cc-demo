---
name: fix-flaky
description: Investigate and fix a flaky or failing test by finding its real cause in the team knowledge base — never by raising timeouts. Use when a test fails intermittently, or run /fix-flaky <test or area>.
---

# Fix a flaky test the team way

The four /karpathy-guidelines rules, applied to a test fix.

## 1. Think first
- **Reproduce:** run the test (`npx playwright test <file>`) and capture the exact error.
- **Watch it happen:** use the Playwright MCP browser to walk through the same steps as
  the test on the live app (http://localhost:4173). Note what the page shows, when it
  changes, and which network requests it makes. This is investigation only: the fix
  stays a normal `.spec.ts`.
- **Look it up:** call `search_docs` with the error code / message, then with the
  behaviour you saw (e.g. the API or flow involved). Read what comes back.

## 2. Keep it simple
- Never raise or lower a timeout, never add `waitForTimeout`.
- Wait for the real event the docs describe (a response, a state change, an element).

## 3. Touch only the task
- Change the test, nothing else. Keep `getByRole` / `getByTestId` locators.
- Match the existing tests: same structure, page objects, helpers and naming as the files
  around it. Don't introduce a new pattern the repo doesn't already use.

## 4. Prove it
- Run the test with `--repeat-each=10`. It must pass every time.
- Report: the cause in one sentence, what you saw in the browser, what you changed, and
  which documents or log lines you based the fix on.
