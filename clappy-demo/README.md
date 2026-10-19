# Clappy demo: three testers, one framework

Input for the live Clappy demo: three tests on [saucedemo.com](https://www.saucedemo.com),
Sauce Labs' public demo shop (login `standard_user` / `secret_sauce`), written separately by
three people:

| File | Author | What it checks |
|---|---|---|
| `flows/add-to-cart.spec.ts` | Anna | adding the backpack shows 1 in the cart |
| `flows/sort-by-price.spec.ts` | Ben | sorting by price low to high starts at $7.99 |
| `flows/checkout.spec.ts` | Chris | the whole checkout, up to "Thank you for your order!" |

Each test carries its own copy of the login (username, password, Login button), and two of
them click the same Add to cart button. That repetition is what Clappy removes.

Run them as they are:

```bash
npm run clappy-demo:test
```

## In our test platform (the live demo)

1. A project named **Swag Labs** with the three tests as web flows, start URL
   `https://www.saucedemo.com/` (paste each file into the flow's **Edit & Run** tab →
   **Apply to flow**).
2. **Env Vars**, profile `default`: `BASE_URL = https://www.saucedemo.com`.
3. **TAF Code → Generate TAF** → report → open the page object → **Sync to GitHub**.

Rehearsal result (2026-10-15): type check passed, 15 elements and 15 methods, 35 files;
the login is defined once and used by all three specs; the generated framework passed 3/3
and 30/30 repeated runs against the live site.

## In Claude Code (Clappy MCP)

```
Use the Clappy MCP to turn the three tests in clappy-demo/flows/ — written separately by
different people — into one test automation framework for https://www.saucedemo.com.
Validate each test first, then generate one suite into ./generated and unzip it. Show me the
page objects and which elements the tests now share. Then install it and run it.
```

Needs the Clappy MCP server, which is not public (see [`../docs/CLAPPY.md`](../docs/CLAPPY.md)).
