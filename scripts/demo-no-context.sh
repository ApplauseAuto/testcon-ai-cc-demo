#!/usr/bin/env bash
# Builds the "no team context" copy used for slide 24 (no context vs. /karpathy-guidelines).
#
# Claude gets only what a tester new to the repo would have: the tests, their page object and
# test data, a Playwright config and the karpathy skill. No CLAUDE.md, no team docs (corpus/), no search_docs,
# no app source. The shop runs from a hidden folder outside the copy, so Claude can test
# against it but can't read how it works.
#
#   npm run demo:no-context            # build the copy + start the hidden shop
#   npm run demo:no-context -- stop    # stop the hidden shop
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Both live outside the repo folder, so Claude can't wander into the real project and its docs.
BASE="${TMPDIR:-/tmp}"; BASE="${BASE%/}"
DIR="$BASE/demo-no-context"
SHOP="$HOME/.cache/testcon-demo-shop"   # away from the copy, so it isn't next door
PIDFILE="$SHOP/shop.pid"

stop_shop() {
  if [ -f "$PIDFILE" ]; then kill "$(cat "$PIDFILE")" 2>/dev/null || true; rm -f "$PIDFILE"; fi
  lsof -ti:4173 | xargs kill 2>/dev/null || true
}

if [ "${1:-}" = "stop" ]; then stop_shop; echo "hidden shop stopped"; exit 0; fi

stop_shop
rm -rf "$DIR" "$SHOP"
mkdir -p "$DIR/tests" "$DIR/.claude/skills" "$SHOP"

# The copy Claude works in
cat > "$DIR/package.json" <<'EOF'
{
  "name": "demo-shop-tests",
  "private": true,
  "type": "module",
  "devDependencies": { "@playwright/test": "^1.63.0" }
}
EOF
mkdir -p "$DIR/pages" "$DIR/test-data"
for f in tests/checkout.spec.ts tests/cart.spec.ts pages/checkout.page.ts test-data/checkout.ts; do
  git -C "$ROOT" show "HEAD:$f" > "$DIR/$f"                 # the original flaky test + its page object
done
cp -R "$ROOT/.claude/skills/karpathy-guidelines" "$DIR/.claude/skills/"
# Only Playwright, copied (a symlink would point Claude back into the repo)
mkdir -p "$DIR/node_modules/.bin" "$DIR/node_modules/@playwright"
cp -R "$ROOT/node_modules/@playwright/test" "$DIR/node_modules/@playwright/"
cp -R "$ROOT/node_modules/playwright" "$ROOT/node_modules/playwright-core" "$DIR/node_modules/"
ln -s ../@playwright/test/cli.js "$DIR/node_modules/.bin/playwright"
cat > "$DIR/playwright.config.ts" <<'EOF'
import { defineConfig } from "@playwright/test";

// Runs against the shop on the shared test environment.
export default defineConfig({
  testDir: "./tests",
  timeout: 20000,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173", headless: true },
});
EOF
echo '{ "mcpServers": {} }' > "$DIR/.mcp.json"

# The shop, outside the copy, with the comments that explain the bug removed
cp -R "$ROOT/site" "$SHOP/"
sed -i.bak -e '/^[[:space:]]*\/\//d' "$SHOP/site/checkout.html" "$SHOP/site/server.js" && rm -f "$SHOP"/site/*.bak
(cd "$SHOP" && nohup node site/server.js > shop.log 2>&1 & echo $! > "$PIDFILE")
sleep 1

cat <<EOF
No-context copy ready: $DIR
Hidden shop running on http://localhost:4173 (stop: npm run demo:no-context -- stop)

  cd $DIR
  claude --strict-mcp-config --mcp-config '{"mcpServers":{}}'

Then type one of:
  The checkout test in tests/checkout.spec.ts is flaky in CI. Fix it.
  /karpathy-guidelines The checkout test in tests/checkout.spec.ts is flaky in CI. Fix it.
EOF
