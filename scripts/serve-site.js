// Fixture "Demo Shop": static checkout page + a small payment API whose
// confirmation is asynchronous, matching corpus/payment-api-spec.md. Like a real
// gateway, the delay varies per payment (0.6–2.8s; PAYMENT_DELAY_MS pins it).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, "..", "site");
const PORT = 4173;
const MIN_MS = 600, MAX_MS = 2800;
const confirmDelay = () =>
  Number(process.env.PAYMENT_DELAY_MS) || MIN_MS + Math.random() * (MAX_MS - MIN_MS);
const payments = new Map();

const json = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch { resolve({}); }
    });
  });

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === "POST" && url.pathname === "/api/payment") {
      const { cartId, amount } = await readBody(req);
      if (!(amount > 0)) return json(res, 400, { error: "INVALID_AMOUNT" });
      const paymentId = randomUUID();
      payments.set(paymentId, { cartId, amount, confirmAt: Date.now() + confirmDelay() });
      return json(res, 202, { paymentId, status: "pending" });
    }

    const statusMatch = url.pathname.match(/^\/api\/payment\/([^/]+)\/status$/);
    if (req.method === "GET" && statusMatch) {
      const p = payments.get(statusMatch[1]);
      if (!p) return json(res, 404, { error: "PAYMENT_NOT_FOUND" });
      const status = Date.now() >= p.confirmAt ? "confirmed" : "pending";
      return json(res, 200, { paymentId: statusMatch[1], status });
    }

    const file = url.pathname === "/" ? "/checkout.html" : url.pathname;
    fs.readFile(path.join(siteDir, path.normalize(file)), (err, data) => {
      if (err) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`demo shop running at http://localhost:${PORT}`));
