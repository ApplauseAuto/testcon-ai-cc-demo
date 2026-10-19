import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadIndex, search } from "../rag.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.VIEWER_PORT || 5050);

const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, { "Content-Type": type });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    try {
      if (url.pathname === "/") {
        return send(res, 200, fs.readFileSync(path.join(__dirname, "index.html"), "utf8"), "text/html");
      }
      if (url.pathname === "/api/index") {
        const { chunks, model } = loadIndex();
        return send(res, 200, {
          model,
          chunks: chunks.map(({ embedding, ...c }) => ({ ...c, dims: embedding.length })),
        });
      }
      if (url.pathname === "/api/search") {
        const q = url.searchParams.get("q") || "";
        if (!q.trim()) return send(res, 400, { error: "empty query" });
        return send(res, 200, await search(q, { k: 5 }));
      }
      send(res, 404, { error: "not found" });
    } catch (err) {
      send(res, 500, { error: String(err.message || err) });
    }
  })
  .listen(PORT, () => console.log(`RAG viewer: http://localhost:${PORT}`));
