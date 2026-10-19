# Demo Shop — checkout test suite

Fictional project for a conference demo. A Playwright suite for a checkout
flow against a local fixture shop (`site/checkout.html` + a payment API in
`site/server.js`, port 4173). Playwright starts the shop automatically.

## Team decisions (read every session — this is the "memory" in the demo)

- Never "fix" a flaky test by raising or lowering a timeout. Wait for the
  actual event (a network response, an element, network-idle).
- Payment confirmation is asynchronous. Never assert `confirmed` straight
  after submitting a payment — poll or wait for the status response.
- Prefer `getByRole` / `getByTestId` locators.
- UI tests use page objects in `pages/` (locators and page actions live there) and
  expected texts in `test-data/`. Specs read like user steps.

## Before fixing or writing a test

Call the `search_docs` tool (MCP server `team-knowledge`) first. It searches
our runbooks, API spec, test conventions, Jira tickets and CI logs. Ground the fix
in what it returns, and say which document you relied on.

## Tools available

- `search_docs` (MCP: team-knowledge) — team knowledge base (Chroma + BM25)
- Playwright MCP (`playwright`) — drive a real browser to inspect the app
- `/fix-flaky`, `/api-tests`, `/karpathy-guidelines` — team skills (`.claude/skills/`)
- `test-reviewer` subagent (`.claude/agents/`) — read-only review against our conventions

## Commands

- `npx playwright test` — run tests in `tests/`
- `npm run viewer` — open the RAG viewer on http://localhost:5050
