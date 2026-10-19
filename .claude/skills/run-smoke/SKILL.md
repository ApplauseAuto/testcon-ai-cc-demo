---
name: run-smoke
description: Run the checkout test suite (Playwright starts the fixture shop itself) and report pass/fail per test. Use when asked to run the tests, run the suite, or run /run-smoke.
---

# Run the checkout smoke suite

```bash
npx playwright test
```

Report pass/fail per test. If a test fails, do not guess a fix — call the
`search_docs` tool with the error message first.
