# Clappy SDK

Clappy is the test-automation SDK we build at Applause. It is **not open source**: the
packages are internal for now. This page explains what it does and what you saw in the talk.

## What it does

1. **Writes tests from plain English.** You describe a test; Clappy drives a real browser
   or phone (web, Android, iOS) and saves the test as code.
2. **Keeps them running.** It replays saved tests and repairs broken locators itself
   (self-healing), so a renamed button doesn't fail the run.
3. **Builds your framework.** It turns tests written by different people, in different
   styles, into one consistent Playwright framework inside your team's own skeleton.

## Building a framework (the live demo)

Input: tests from anywhere, recorded, AI-written or hand-written. In the demo, three tests
on [saucedemo.com](https://www.saucedemo.com) written separately by Anna, Ben and Chris
([`clappy-demo/flows/`](../clappy-demo/flows/)).

What Clappy does:

| Step | What happens |
|---|---|
| Read the tests | parses each test into steps and elements |
| Find the pages | groups steps by screen (AI, with a URL-based fallback) |
| Page objects | every element defined once; parts used on several pages by several tests become components |
| Name things | readable method names from the AI; plain names without a key |
| Fill the skeleton | copies only the framework files the tests use from your team's template |
| Type check | the project compiles before you see it; anything missing is listed as a TODO |

Output: page objects, specs, environment configs and a CI workflow, as a pull request on
your GitHub repo or as a zip.

From the demo rehearsal (three saucedemo tests): one page object holds the login
(username, password, Login button) once, and all three specs call it; type check passed;
35 files; the generated framework passed 3/3 and 30/30 repeated runs against the live site.

## Where it runs

| Where | How |
|---|---|
| Our test platform | one click: TAF Code → Generate TAF (the live demo) |
| Claude Code | as an MCP server: `validate_flow_spec`, `generate_test` |
| CI pipelines | the `clappy` CLI: `clappy generate --config …` |
| Your own tools | the `clappy-core` library |

The packages (`clappy-core`, `clappy-cli`, `clappy-mcp`) are not public, so this repo doesn't
wire the Clappy MCP server in.

## The demo tests, written from plain English

In the platform, Clappy writes tests from a description (start URL `https://www.saucedemo.com/`;
`standard_user` / `secret_sauce` are Sauce Labs' public demo credentials):

```
Log in with username "standard_user" and password "secret_sauce".
Click "Add to cart" for the product "Sauce Labs Backpack".
Verify the shopping cart icon shows "1".
```
```
Log in with username "standard_user" and password "secret_sauce".
Sort the products by "Price (low to high)".
Verify the first product price is "$7.99".
```
```
Log in with username "standard_user" and password "secret_sauce".
Click "Add to cart" for the product "Sauce Labs Backpack".
Open the shopping cart and click "Checkout".
Enter first name "Chris", last name "Tester" and zip code "01001", then click "Continue".
Click "Finish".
Verify the page shows "Thank you for your order!".
```

The hand-written equivalents are in [`clappy-demo/flows/`](../clappy-demo/flows/) and run as they are:
`npm run clappy-demo:test`.

## Everything else

The demo shows one job. For chatbot testing, localization, RAG Forge, CI runs and the
rest, see [`CLAPPY-FEATURES.md`](CLAPPY-FEATURES.md).

## Access

Clappy is used inside Applause today. If you want to try it on your own tests, talk to us
after the session or reach out to Applause.
