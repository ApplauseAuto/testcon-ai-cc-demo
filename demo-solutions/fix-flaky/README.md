# /fix-flaky: the team skill with the docs (run C)

`/fix-flaky tests/checkout.spec.ts` in the real repo (CLAUDE.md, search_docs, Playwright MCP).
The fix went into the page object: `pay()` waits for the status response that says
`confirmed`; the test uses the page object and `test-data/` for its checks.
Claude's run: 10/10, 3/3 at 7.5 s. Re-checked: 20/20, 3/3 at 8 s, 2/2 at 12 s.
See `report.txt` and `tool-calls.txt`.
