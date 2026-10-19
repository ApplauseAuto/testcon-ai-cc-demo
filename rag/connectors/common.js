// Shared helpers for the connectors: auth header, output folder, HTML → plain Markdown.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

// Atlassian Cloud: email + API token (basic auth). Server/DC: a personal access token (bearer).
// Public instances need neither.
export function authHeaders() {
  const { ATLASSIAN_EMAIL, ATLASSIAN_TOKEN, ATLASSIAN_PAT } = process.env;
  if (ATLASSIAN_PAT) return { Authorization: `Bearer ${ATLASSIAN_PAT}` };
  if (ATLASSIAN_EMAIL && ATLASSIAN_TOKEN) {
    return { Authorization: `Basic ${Buffer.from(`${ATLASSIAN_EMAIL}:${ATLASSIAN_TOKEN}`).toString("base64")}` };
  }
  return {};
}

export async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json", ...authHeaders() } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

export function outDir() {
  const dir = path.resolve(ROOT, arg("out", "corpus"));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

// Good enough for indexing: keep headings and list items, drop the rest of the markup.
export function htmlToMarkdown(html = "") {
  return String(html)
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gis, (_, t) => `\n### ${t}\n`)
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<br\s*\/?>|<\/p>|<\/div>|<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
