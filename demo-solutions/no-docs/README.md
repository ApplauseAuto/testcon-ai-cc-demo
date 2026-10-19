# Without team docs: runs A and B

A copy of the repo with only the tests, the page object and test data (no CLAUDE.md, no docs,
no search_docs), built by `npm run demo:no-context`.

- **A**, plain prompt: `The checkout test in tests/checkout.spec.ts is flaky in CI. Fix it.`
- **B**, the same prompt with `/karpathy-guidelines` in front.

Both made the same code change (`pages/`, `tests/`): no sleep, a retrying check that gives up
after Playwright's default 5 s. Passes on normal days (20/20); fails when payment takes 8 s
(busy hours in the runbook). The difference is the answer: A reported "Fixed" with local runs
only; B named the risk ("only about 1.5 s of slack… if CI is much slower it could still time
out… I haven't seen CI timings") and asked. See `report-plain-prompt.txt`, `report-karpathy.txt`.
