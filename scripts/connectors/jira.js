// Jira → corpus/: one Markdown file per issue (## Summary, ## Description, ## Comments),
// the format lib/rag.js splits into chunks.
//
//   JIRA_URL=https://your-company.atlassian.net npm run connect:jira -- --jql "project = QA AND updated >= -90d"
//   (auth: ATLASSIAN_EMAIL + ATLASSIAN_TOKEN, or ATLASSIAN_PAT; none for public instances)
import fs from "node:fs";
import path from "node:path";
import { arg, getJson, outDir, slug, htmlToMarkdown } from "./common.js";

const base = (process.env.JIRA_URL || arg("url", "")).replace(/\/$/, "");
const jql = arg("jql", "");
const max = Number(arg("max", "50"));
if (!base || !jql) {
  console.error('Usage: JIRA_URL=https://… npm run connect:jira -- --jql "project = QA" [--max 50] [--out corpus]');
  process.exit(1);
}

const fields = "summary,description,comment,status,issuetype,priority,labels";
// Atlassian Cloud retired /rest/api/2/search for /rest/api/3/search/jql; Server/DC still use the v2 path.
const cloud = /\.atlassian\.net$/.test(new URL(base).hostname);
const searchPath = cloud ? "/rest/api/3/search/jql" : "/rest/api/2/search";
const url = `${base}${searchPath}?jql=${encodeURIComponent(jql)}&maxResults=${max}&fields=${fields}&expand=renderedFields`;
const { issues = [] } = await getJson(url);
const dir = outDir();

for (const issue of issues) {
  const f = issue.fields;
  const rendered = issue.renderedFields || {};
  const comments = (f.comment?.comments || [])
    .map((c, i) => `- ${c.author?.displayName || "someone"}: ${htmlToMarkdown(rendered.comment?.comments?.[i]?.body || c.body)}`)
    .join("\n");
  const md = [
    `# Jira ${issue.key}: ${f.summary}`,
    "",
    "## Summary",
    `${f.summary}`,
    `Type: ${f.issuetype?.name ?? "?"} · Status: ${f.status?.name ?? "?"} · Priority: ${f.priority?.name ?? "?"}${f.labels?.length ? ` · Labels: ${f.labels.join(", ")}` : ""}`,
    "",
    "## Description",
    htmlToMarkdown(rendered.description || f.description || "(no description)"),
    "",
    "## Comments",
    comments || "(no comments)",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(dir, `jira-${issue.key}.md`), md);
}
console.log(`Wrote ${issues.length} Jira issue(s) to ${path.relative(process.cwd(), dir) || "."}. Next: npm run index`);
