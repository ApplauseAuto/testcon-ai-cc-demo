# A Tester's Guide to Claude Code

Companion repo for the talk by **Adonis Celestine** and **Taras Lytvyn** (Applause) at
**TestCon Europe 2026**, Vilnius, 21 October 2026.

Everything from the talk is here and runs on your machine: the slides, the team setup for
Claude Code (rules, skills, a subagent, a hook), a local knowledge base (RAG) that Claude
searches through MCP, the flaky-test story with every real result, and the Clappy SDK demo
tests on Sauce Labs' public demo shop.

## What's inside

| | Where |
|---|---|
| **Slides** (pptx + pdf) | [`presentation/`](presentation/) |
| **Set up a RAG knowledge base for Claude Code**: Chroma, indexing, Jira/Confluence connectors, the knowledge map, connecting it to Claude Code | [`docs/RAG-SETUP.md`](docs/RAG-SETUP.md) |
| **/karpathy-guidelines**: the skill, how to install it, how we used it, reading list | [`docs/KARPATHY-GUIDELINES.md`](docs/KARPATHY-GUIDELINES.md) |
| **Try the demos yourself**: the flaky test, `/fix-flaky`, Claude without your docs | [`docs/TRY-THE-DEMOS.md`](docs/TRY-THE-DEMOS.md) |
| **Clappy SDK**: what it is (not open source) and the Swag Labs demo | [`docs/CLAPPY.md`](docs/CLAPPY.md), [`clappy-demo/`](clappy-demo/) |

## The team setup from the talk

```
CLAUDE.md                      team rules Claude reads every session
.mcp.json                      tools: search_docs (our docs) + Playwright MCP (a real browser)
.claude/skills/fix-flaky/      the four karpathy rules + our docs, as one team skill
.claude/skills/api-tests/      write API tests from the team docs
.claude/skills/karpathy-guidelines/   the community skill (MIT)
.claude/agents/test-reviewer.md       a read-only reviewer subagent
.claude/settings.json          a hook that blocks rm -rf test-results/
pages/, test-data/, tests/     the Demo Shop suite: page objects, expected texts, specs
corpus/                        the team's docs: runbook, API spec, conventions, a Jira ticket, CI logs
demo-solutions/                the real results behind the slides (code, Claude's reports, tool calls)
```

## Quick start

Requirements: Node 18+, Docker Desktop (for Chroma), [Claude Code](https://code.claude.com/docs).

```bash
npm install
npx playwright install chromium
npm run chroma        # Chroma (search database) in Docker on :8000
npm run index         # split + embed corpus/ and store it in Chroma
claude                # in this folder; approve the project MCP servers once
```

See the flaky test fail (about 4 runs in 10), then let the team skill fix it:

```bash
npx playwright test tests/checkout.spec.ts --repeat-each=10
```
```
/fix-flaky the checkout test
```

`npm run reset` puts the flaky test back.

## The result in one line

**Rules make Claude honest. Your docs make it right. A team skill makes it the same for everyone.**
The three real runs behind that sentence are in [`demo-solutions/`](demo-solutions/).

## Links

- Claude Code docs: https://code.claude.com/docs
- Andrej Karpathy's notes: https://x.com/karpathy/status/2015883857489522876
- The karpathy-guidelines skill: https://github.com/multica-ai/andrej-karpathy-skills
- QA skills: https://qaskills.sh
- Sauce Labs demo shop: https://www.saucedemo.com

## License

MIT, see [`LICENSE`](LICENSE). The bundled `karpathy-guidelines` skill is MIT-licensed by its
authors (github.com/multica-ai/andrej-karpathy-skills).
