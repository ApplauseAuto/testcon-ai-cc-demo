---
name: retrieve
description: Search the team knowledge base (runbooks, API spec, test conventions, Jira tickets, CI logs) with hybrid embeddings + BM25 retrieval and show all three result lists. Use to explain or debug retrieval, or run /retrieve.
---

# Retrieve from the team knowledge base (CLI view)

Prefer the `search_docs` MCP tool for normal work. This skill shows the raw
breakdown — meaning matches, keyword matches, and the fused ranking — which
is useful for explaining how retrieval works:

```bash
node scripts/hybrid-retrieve.js "<the question, verbatim>"
```

Summarise: what the meaning (embeddings) search found, what the keyword
(BM25) search found, and what ended up on top after fusion.
