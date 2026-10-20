# Clappy and our test platform: everything beyond the demo

The live demo showed one thing: Clappy building a test framework (TAF) from three tests,
in one click. This page lists what else Clappy and our test platform at Applause do.
For what Clappy is and how the framework is built, see [`CLAPPY.md`](CLAPPY.md).

Clappy is internal to Applause today; it is not open source. If you want to try it on your
own tests, talk to us after the session or reach out to Applause.

## Writing tests

- **Five test types:** web desktop, web on Android Chrome, web on iPhone Safari, native
  Android apps, native iOS apps.
- **Plain-English generation:** describe the test; the AI drives a real browser or phone
  and saves the steps and the code.
- **Co-pilot mode:** watch the AI live, pause it, take over, then resume or stop.
- **Explore & Debug:** let the AI explore an app, then turn what it found into a test.
- **Recording:** record a test by clicking through it yourself.
- **Edit without regenerating:** a visual step editor, and a code editor with an AI chat.
- **Steps for real-world tests:**
  - API calls inside a UI test (`API:` steps)
  - email one-time codes (OTP) read from a shared inbox
  - IF / ELSE conditions (new)
  - network checks: assert on requests and responses, including analytics beacons
  - file-download checks
- **Grounded assertions:** a passing check is saved together with the element or code line
  that proved it.
- **Cross-platform relay:** one test that continues across platforms, for example it
  starts on web and finishes on mobile.

## Running and maintaining tests

- **Replay with self-healing:** saved steps replay fast. If the page changed, the AI agent
  finishes the test from its description. On mobile, low-confidence repairs are flagged
  for a person to review.
- **Your own machine:** a pairing app runs tests on your Mac, with your browser, an Android
  phone or an iPhone, with a live screen and video.
- **Cloud devices:** BrowserStack, with video and network logs.
- **Suites and environments:** suites, environment profiles (dev, staging, …), run
  comparison, and video and screenshots for every run.
- **Pop-ups and cookie banners** are dismissed automatically.

## Specialised testing

- **AI chatbot testing:** drive a chat UI, generate test scenarios, grade the bot's
  answers with an AI judge ([promptfoo](https://www.promptfoo.dev/)), and add your own checks.
- **Chatbot red-teaming:** attack strategies such as prompt injection and jailbreaks,
  judged automatically.
- **Localization testing:** run one test across many locales, pseudo-localization, checks
  for untranslated or cut-off labels, date and number formats, AI vision review of
  screenshots, visual diffs and campaign reports, on web and mobile.

## Knowledge and test management

- **RAG Forge:** connect your team's knowledge, the same idea as the RAG setup in this
  repo ([`RAG-SETUP.md`](RAG-SETUP.md)). Connectors: Jira, Confluence, TestRail, Zephyr,
  Jama, GitHub, Google Docs and Sheets, Figma, OpenAPI / Swagger specs, local docs and
  code, and uploads.
- **Test cases** generated from that knowledge, organised in folders.
- **Traceability:** a matrix that links requirements, test cases and automated tests, with
  AI coverage scoring.

## Framework and CI (beyond the demo's one click)

- **Generate TAF for web, mobile and mixed projects,** inside your team's own skeleton.
- **Logins move to environment variables;** passwords never go into the code.
- **Regenerate TAF** rebuilds the generated files and keeps the files you added yourself.
- **GitHub sync both ways:** a pull request or a direct commit, and pulling back changes
  made in GitHub.
- **CI runs:** a GitHub Actions workflow builder, push or manual triggers, environment
  selection, and an Allure report inside the run result.

## A person stays in the loop

Clappy writes the code; people approve it. Testers review the steps Clappy recorded, can
take over in co-pilot mode, read the generation report (does it compile, is anything left
to finish by hand), and every framework change arrives as a pull request the team
reviews before merging.

## Clappy outside the platform

| Where | How |
|---|---|
| CI pipelines | the `clappy` command-line tool: `clappy generate` |
| Claude Code, Cursor and other AI coding tools | an MCP server: Claude calls Clappy as a tool |
| Your own scripts | the `clappy-core` library |

## Platform

- Multi-user projects with roles and members.
- Your choice of AI models (Anthropic, OpenAI, Google), with per-project keys.
- Credentials stored encrypted.
