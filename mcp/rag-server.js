// MCP server exposing the team knowledge base to Claude Code as a tool.
// stdout is reserved for the MCP protocol, so all logging goes to stderr.
console.log = (...args) => console.error(...args);

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { search } from "../lib/rag.js";

const server = new McpServer({ name: "team-knowledge", version: "1.0.0" });

server.registerTool(
  "search_docs",
  {
    title: "Search team docs and logs",
    description:
      "Hybrid search (embeddings + BM25) over the team's runbooks, API spec, test conventions and " +
      "incident logs. Use before proposing a fix for a failing test or writing a new test, so the " +
      "answer is grounded in how this system actually behaves.",
    inputSchema: {
      query: z.string().describe("Natural-language question or an exact error code"),
      k: z.number().int().min(1).max(10).optional().describe("How many chunks to return (default 4)"),
    },
  },
  async ({ query, k = 4 }) => {
    const r = await search(query, { k });
    const lines = r.hybrid.map(
      (h, i) => `[${i + 1}] ${h.source} — ${h.section}  (found via ${h.via.join(" + ")})\n${h.text}`
    );
    return {
      content: [
        {
          type: "text",
          text: `Vector store: ${r.backend}. Top ${lines.length} results for "${query}":\n\n${lines.join("\n\n")}`,
        },
      ],
    };
  }
);

await server.connect(new StdioServerTransport());
