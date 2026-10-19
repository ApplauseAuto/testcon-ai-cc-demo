# /karpathy-guidelines

**Repo:** https://github.com/multica-ai/andrej-karpathy-skills (moved from
`forrestchang/andrej-karpathy-skills`; the old name redirects)

A free, community-written skill: one file of rules for Claude Code, based on
[Andrej Karpathy's notes](https://x.com/karpathy/status/2015883857489522876) on how AI
models fail at coding. They make silent assumptions, overcomplicate, change code they
weren't asked to touch, and say "done" without proof.

## Get it

As a plugin, in Claude Code:

```
/plugin marketplace add multica-ai/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```

Or per project: copy the skill into `.claude/skills/` (this repo has it in
[`.claude/skills/karpathy-guidelines/`](../.claude/skills/karpathy-guidelines/)), or add its
rules to your `CLAUDE.md`.

## Use it

- In a prompt: `/karpathy-guidelines Fix the flaky checkout test.`
- For every task in a repo: add `Follow /karpathy-guidelines` to `CLAUDE.md`.

## The four rules, and what they mean for test work

| Rule | On a real project |
|---|---|
| Think first | it states its assumptions and asks, instead of guessing |
| Keep it simple | the minimum code: no extra helpers, retries or options |
| Touch only the task | small diffs: one test fix doesn't rewrite the framework |
| Prove it | it shows how it checked: "passed 30/30", not just "done" |

## What it did in our demo (real runs)

The flaky checkout test, fixed with no team docs (a copy of the repo with only the tests, the
page object and test data):

- **Plain prompt:** removed the 2-second sleep and used a retrying check (Playwright's default
  5 s), then reported "Fixed", based on local runs only.
- **With /karpathy-guidelines:** the same code change, but it named the risk and asked:
  "only about 1.5 s of slack… If CI is much slower it could still time out… I haven't seen CI
  timings. Say if you want it."

Both pass on normal days and fail when payment takes 8 s, which the team's runbook says happens
at busy hours. The skill made Claude honest about what it didn't know; the docs have the answer
(wait for the "confirmed" status response). That's why our `/fix-flaky` skill combines the four
rules with `search_docs` ([`.claude/skills/fix-flaky/SKILL.md`](../.claude/skills/fix-flaky/SKILL.md)).
Code and both reports: [`demo-solutions/no-docs/`](../demo-solutions/no-docs/); the skill run:
[`demo-solutions/fix-flaky/`](../demo-solutions/fix-flaky/).

## Reading list

1. Andrej Karpathy's notes on coding with Claude: https://x.com/karpathy/status/2015883857489522876
2. The skill file: https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md
3. Why it took off (Medium): https://medium.com/@ketaki.kolhatkar99/the-hype-behind-andrej-karpathys-claude-md-file-17a1f1b0778c
4. The most popular AI coding skills right now (dev.to, AWS): https://dev.to/aws/the-most-popular-ai-coding-skills-right-now-4183
