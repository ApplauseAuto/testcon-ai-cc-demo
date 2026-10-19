// Confluence → corpus/: one Markdown file per page (## Content), the format rag/rag.js
// splits into chunks.
//
//   CONFLUENCE_URL=https://your-company.atlassian.net/wiki npm run connect:confluence -- --cql 'space = QA and type = page'
//   (auth: ATLASSIAN_EMAIL + ATLASSIAN_TOKEN, or ATLASSIAN_PAT; none for public instances)
import fs from "node:fs";
import path from "node:path";
import { arg, getJson, outDir, slug, htmlToMarkdown } from "./common.js";

const base = (process.env.CONFLUENCE_URL || arg("url", "")).replace(/\/$/, "");
const cql = arg("cql", "");
const max = Number(arg("max", "25"));
if (!base || !cql) {
  console.error("Usage: CONFLUENCE_URL=https://…/wiki npm run connect:confluence -- --cql 'space = QA and type = page' [--max 25] [--out corpus]");
  process.exit(1);
}

const url = `${base}/rest/api/content/search?cql=${encodeURIComponent(cql)}&limit=${max}&expand=body.storage,space,version`;
const { results = [] } = await getJson(url);
const dir = outDir();

for (const page of results) {
  // Confluence headings become ### so each page stays one "## Content" chunk group.
  const body = htmlToMarkdown(page.body?.storage?.value || "");
  const md = [
    `# Confluence: ${page.title}`,
    "",
    "## Content",
    `Space: ${page.space?.name ?? page.space?.key ?? "?"} · Version: ${page.version?.number ?? "?"}`,
    "",
    body || "(empty page)",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(dir, `confluence-${slug(page.title)}.md`), md);
}
console.log(`Wrote ${results.length} Confluence page(s) to ${path.relative(process.cwd(), dir) || "."}. Next: npm run index`);
