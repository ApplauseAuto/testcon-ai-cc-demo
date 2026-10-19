# RAG setup: give Claude Code your team's knowledge

Claude knows Playwright. It doesn't know your system. RAG (retrieval-augmented generation)
is a search Claude runs over your team's docs before it answers. This repo has a complete,
local version: your docs → a search database (Chroma) → a `search_docs` tool in Claude Code.

```
corpus/  ──npm run index──▶  Chroma (Docker, :8000)  ◀──search_docs──  Claude Code
 docs        split + embed      + data/index.json        (MCP server)     cites the source
```

Everything runs on your machine. The embedding model (`all-MiniLM-L6-v2`, via
Transformers.js) is downloaded once (~90 MB) and then works offline.

## Where the code is

| File | What it does |
|---|---|
| `rag/rag.js` | splitting, local embeddings, keyword search (BM25), merging the two |
| `rag/index.js` | `npm run index`: builds the index and loads it into Chroma |
| `rag/mcp-server.js` | the `search_docs` tool for Claude Code |
| `rag/viewer/` | `npm run viewer`: the knowledge map |
| `rag/ask.js` | `npm run ask`: the same search from the terminal |
| `rag/connectors/` | `npm run connect:jira` / `connect:confluence` |
| `corpus/` | the documents |

## 1. Start Chroma

[Chroma](https://www.trychroma.com) is a free, open-source search database. Run it in Docker:

```bash
npm run chroma      # docker run -d --name demo-chroma -p 8000:8000 -v demo-chroma-data:/data chromadb/chroma:latest
```

Next time: `docker start demo-chroma`. Another host or port: set `CHROMA_URL`
(default `http://localhost:8000`). If Chroma isn't running, the search falls back to the
local index file, so the demo still works; `npm run index` tells you which one it used.

## 2. Add your documents

Put files in `corpus/`. Two formats are understood:

| File | How it is split |
|---|---|
| `*.md` | one chunk per `## ` section; the `# ` title is added to every chunk |
| anything else (e.g. `*.log`) | one chunk per non-empty line |

So write (or export) docs with `## ` headings: one topic per section. The demo corpus has a
runbook, an API spec, test conventions, a Jira ticket and CI logs.

### Connectors: pull from Jira and Confluence

Two scripts write Jira issues and Confluence pages into `corpus/` as Markdown:

```bash
# Jira: one file per issue (## Summary, ## Description, ## Comments)
JIRA_URL=https://your-company.atlassian.net \
  npm run connect:jira -- --jql "project = QA AND updated >= -90d" --max 50

# Confluence: one file per page (## Content)
CONFLUENCE_URL=https://your-company.atlassian.net/wiki \
  npm run connect:confluence -- --cql "space = QA and type = page" --max 25
```

Authentication, as environment variables:
- Atlassian Cloud: `ATLASSIAN_EMAIL` + `ATLASSIAN_TOKEN` (an API token from id.atlassian.com)
- Server / Data Center: `ATLASSIAN_PAT` (a personal access token)
- Public instances: nothing

Options: `--max` (how many), `--out` (another folder, default `corpus`).

Tested against the public Apache Jira and Confluence (anonymous); the Atlassian Cloud
search endpoint (`/rest/api/3/search/jql`) is used automatically for `*.atlassian.net`.
Other sources (TestRail, Xray, Zephyr, Figma notes, API specs): export to Markdown with
`## ` sections and drop the files into `corpus/`.

## 3. Index

```bash
npm run index
```

It splits every file, embeds each chunk, writes `data/index.json` (also used for the
keyword search and the map) and loads the vectors into the Chroma collection
`demo-shop-docs`. Run it again whenever the docs change.

## 4. Look at it: the knowledge map

```bash
npm run viewer      # http://localhost:5050
```

Every dot is one chunk, coloured by the file it came from, placed so that chunks about the
same topic sit close together. Type a question, or click a preset, and you see both
searches side by side:

- **by meaning** (embeddings in Chroma): finds "purchase test randomly breaks" even with no shared words
- **by exact words** (BM25): finds IDs like `QA-1432`, which have no meaning to an embedding
- **merged** (reciprocal rank fusion): what Claude actually receives, bottom right

From the terminal: `npm run ask -- "Why is the checkout test flaky in CI?"`

## 5. Connect it to Claude Code

The MCP server is `rag/mcp-server.js` (about 40 lines). It's registered for this project in
`.mcp.json`:

```json
{
  "mcpServers": {
    "team-knowledge": { "command": "node", "args": ["rag/mcp-server.js"] }
  }
}
```

and `CLAUDE.md` tells Claude when to use it:

```
Call the `search_docs` tool (MCP server `team-knowledge`) first. It searches our runbooks,
API spec, test conventions, Jira tickets and CI logs. Ground the fix in what it returns,
and say which document you relied on.
```

Start `claude` in the repo and approve the project MCP servers once (`/mcp` shows them).
Then ask something only your docs know:

```
Why does the checkout test fail in CI? Use search_docs.
```

## Other options

- **Start simple, no index:** connect the Atlassian MCP server; Claude searches Confluence
  and Jira live with your login.
- **Managed:** AWS Bedrock Knowledge Bases or Google Vertex AI RAG Engine do the
  collecting, splitting, embedding and storing for you.
- **Swap the parts:** any vector store (pgvector, Qdrant, OpenSearch), any embedding model
  (OpenAI, Voyage, Bedrock Titan), any keyword engine (Elasticsearch, OpenSearch). The MCP
  tool and the `CLAUDE.md` line stay the same.
