// PreToolUse hook: reads the tool-call JSON from stdin, blocks any Bash
// command that looks like a broad "rm -rf test-results" wipe, but
// allows scoped variants (e.g. "rm -rf test-results/tmp-*").
import { readFileSync } from "node:fs";

let input = "";
try {
  input = readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const command = payload?.tool_input?.command || "";
const isBroadWipe = /rm\s+-rf\s+test-results\/?\s*$/.test(command.trim());

if (isBroadWipe) {
  console.log(
    JSON.stringify({
      decision: "block",
      reason:
        "Blocked: 'rm -rf test-results/' wipes the whole directory, including artifacts from " +
        "other in-progress worktrees. Scope the deletion, e.g. 'rm -rf test-results/tmp-*'.",
    })
  );
  process.exit(0);
}

process.exit(0);
