---
name: api-tests
description: Write Playwright API tests (no browser) for an endpoint or service, grounded in the team knowledge base. Use when asked to write, extend or review API tests, or run /api-tests <what to test>.
---

# Write API tests the team way

1. **Look it up first.** Call the `search_docs` tool for the API's behaviour
   (endpoints, status codes, async flows, error codes) and for our test
   conventions. Do not guess behaviour the docs describe.
2. **Write the tests** in `tests/api/<name>.api.spec.ts`:
   - use Playwright's `request` fixture — no `page`, no browser
   - happy path, every documented error code, and any asynchronous state change
   - for asynchronous results use `expect.poll` with the interval/timeout the spec recommends;
     never assert a final state on the first response
   - one behaviour per test, test names that read like requirements
3. **Run them:** `npx playwright test tests/api`
4. **Report:** pass/fail per test, which documents each test is based on, and any
   gap where the spec and the real API disagree.
