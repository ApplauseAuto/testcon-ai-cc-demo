// Shared RAG core: chunking, local embeddings, BM25, hybrid fusion, 2D map.
// Vector search goes to Chroma when it's reachable (CHROMA_URL, default
// http://localhost:8000), otherwise falls back to an in-process cosine search
// over data/index.json so the demo still works with no server at all.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline, env } from "@xenova/transformers";
import { ChromaClient } from "chromadb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "..");
const CORPUS_DIR = path.join(ROOT, "corpus");
const INDEX_FILE = path.join(ROOT, "data", "index.json");
const COLLECTION = "demo-shop-docs";
const MODEL = "Xenova/all-MiniLM-L6-v2";

env.cacheDir = path.join(ROOT, ".model-cache");

// ---------- corpus ----------

export function loadCorpus() {
  const chunks = [];
  for (const file of fs.readdirSync(CORPUS_DIR).sort()) {
    const raw = fs.readFileSync(path.join(CORPUS_DIR, file), "utf8");
    if (file.endsWith(".md")) {
      const title = (raw.match(/^# (.+)$/m) || [, file])[1];
      raw.split(/\n(?=## )/).slice(1).forEach((section) => {
        const heading = section.match(/^## (.+)$/m)[1];
        const body = section.replace(/^## .+\n/, "").trim();
        chunks.push({
          id: `${file}#${slug(heading)}`,
          source: file,
          kind: "doc",
          section: heading,
          text: `${title} — ${heading}\n${body}`,
        });
      });
    } else {
      raw.split("\n").map((l) => l.trim()).filter(Boolean).forEach((line, i) => {
        chunks.push({ id: `${file}#L${i + 1}`, source: file, kind: "log", section: `line ${i + 1}`, text: line });
      });
    }
  }
  return chunks;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---------- embeddings ----------

let extractorPromise;
export async function embed(text) {
  extractorPromise ||= pipeline("feature-extraction", MODEL);
  const extractor = await extractorPromise;
  const out = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

function cosine(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are normalized
}

// ---------- BM25 ----------

const STOPWORDS = new Set(
  "a an and are as at be but by does do for from has have how i if in into is it its no not of on or so such than that the their then there these they this to was what when where which why will with you your".split(" ")
);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9_]+/g) || []).filter((t) => !STOPWORDS.has(t));
}

export function bm25(query, chunks, { k1 = 1.5, b = 0.75 } = {}) {
  const docs = chunks.map((c) => tokenize(c.text));
  const avg = docs.reduce((s, d) => s + d.length, 0) / docs.length;
  const df = new Map();
  docs.forEach((d) => new Set(d).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const N = docs.length;
  const terms = tokenize(query);
  return chunks
    .map((chunk, i) => {
      const tf = new Map();
      docs[i].forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
      let score = 0;
      const matched = [];
      for (const t of terms) {
        const f = tf.get(t);
        if (!f) continue;
        const n = df.get(t);
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * docs[i].length) / avg)));
        matched.push(t);
      }
      return { ...pick(chunk), score, matched: [...new Set(matched)] };
    })
    .filter((r) => r.score > 0)
    .sort((x, y) => y.score - x.score);
}

// ---------- 2D map ----------
// Sammon mapping: place points in 2D so that pairs that are close in the
// 384-dim embedding space stay close on screen (it weights small distances
// heavily, so neighbourhoods survive the squeeze better than plain PCA).

const dist = (a, b) => Math.max(1e-4, 1 - cosine(a, b));

function sammonLayout(vectors, iterations = 3000) {
  const n = vectors.length;
  const D = vectors.map((a) => vectors.map((b) => dist(a, b)));
  let pos = vectors.map((_, i) => [Math.cos(i * 2.399) * (0.2 + i / n), Math.sin(i * 2.399) * (0.2 + i / n)]);
  for (let it = 0; it < iterations; it++) {
    const grad = pos.map(() => [0, 0]);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1];
        const d2 = Math.max(1e-6, Math.hypot(dx, dy));
        const g = ((d2 - D[i][j]) / (D[i][j] * d2));
        grad[i][0] += g * dx; grad[i][1] += g * dy;
        grad[j][0] -= g * dx; grad[j][1] -= g * dy;
      }
    }
    const gmax = Math.max(1e-9, ...grad.map((g) => Math.hypot(g[0], g[1])));
    const step = 0.05 * Math.pow(0.002, it / iterations); // anneal 0.05 -> 0.0001
    pos = pos.map((p, i) => [p[0] - (step * grad[i][0]) / gmax, p[1] - (step * grad[i][1]) / gmax]);
  }
  return pos;
}

// The query star is drawn at the similarity-weighted centre of its 3 closest
// chunks, so it always sits among its real matches on the map.
export function placePoint(vec, chunks) {
  const top = chunks
    .map((c) => ({ c, sim: cosine(vec, c.embedding) }))
    .sort((x, y) => y.sim - x.sim)
    .slice(0, 3);
  const w = top.map((t) => Math.exp(t.sim / 0.05));
  const total = w.reduce((s, x) => s + x, 0);
  const p = [0, 0];
  top.forEach((t, i) => { p[0] += (t.c.xy[0] * w[i]) / total; p[1] += (t.c.xy[1] * w[i]) / total; });
  return p;
}

// ---------- index build ----------

export async function buildIndex({ log = console.log } = {}) {
  const chunks = loadCorpus();
  log(`Embedding ${chunks.length} chunks with ${MODEL} (local, offline)...`);
  for (const c of chunks) c.embedding = await embed(c.text);
  const layout = sammonLayout(chunks.map((c) => c.embedding));
  chunks.forEach((c, i) => (c.xy = layout[i]));
  fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify({ model: MODEL, chunks }));
  log(`Wrote ${INDEX_FILE}`);

  const chroma = await chromaCollection({ reset: true });
  if (chroma) {
    await chroma.add({
      ids: chunks.map((c) => c.id),
      embeddings: chunks.map((c) => c.embedding),
      documents: chunks.map((c) => c.text),
      metadatas: chunks.map((c) => ({ source: c.source, section: c.section, kind: c.kind })),
    });
    log(`Loaded ${chunks.length} vectors into Chroma collection "${COLLECTION}" at ${chromaUrl()}`);
  } else {
    log(`Chroma not reachable at ${chromaUrl()} — local index only (still fully searchable).`);
  }
  return chunks.length;
}

let cachedIndex;
export function loadIndex() {
  if (!cachedIndex) {
    if (!fs.existsSync(INDEX_FILE)) throw new Error("No index yet — run: npm run index");
    cachedIndex = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
  }
  return cachedIndex;
}

// ---------- Chroma ----------

function chromaUrl() {
  return process.env.CHROMA_URL || "http://localhost:8000";
}

async function chromaCollection({ reset = false } = {}) {
  try {
    const url = new URL(chromaUrl());
    const client = new ChromaClient({
      host: url.hostname,
      port: Number(url.port) || (url.protocol === "https:" ? 443 : 80),
      ssl: url.protocol === "https:",
    });
    await client.heartbeat();
    if (reset) {
      try { await client.deleteCollection({ name: COLLECTION }); } catch {}
    }
    return await client.getOrCreateCollection({
      name: COLLECTION,
      configuration: { hnsw: { space: "cosine" } },
      embeddingFunction: null,
    });
  } catch {
    return null;
  }
}

// ---------- search ----------

function pick(c) {
  return { id: c.id, source: c.source, section: c.section, kind: c.kind, text: c.text, xy: c.xy };
}

export async function search(query, { k = 5 } = {}) {
  const index = loadIndex();
  const byId = new Map(index.chunks.map((c) => [c.id, c]));
  const qVec = await embed(query);

  let backend = "local";
  let semantic;
  const chroma = await chromaCollection();
  if (chroma) {
    const res = await chroma.query({ queryEmbeddings: [qVec], nResults: k });
    semantic = res.ids[0].map((id, i) => ({ ...pick(byId.get(id)), score: 1 - res.distances[0][i] }));
    backend = "chroma";
  } else {
    semantic = index.chunks
      .map((c) => ({ ...pick(c), score: cosine(qVec, c.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  const lexical = bm25(query, index.chunks).slice(0, k);

  // Reciprocal Rank Fusion: score = sum over lists of 1 / (60 + rank)
  const fused = new Map();
  const addList = (list, name) =>
    list.forEach((r, rank) => {
      const entry = fused.get(r.id) || { ...r, rrf: 0, via: [] };
      entry.rrf += 1 / (60 + rank + 1);
      entry.via.push(`${name} #${rank + 1}`);
      fused.set(r.id, entry);
    });
  addList(semantic, "meaning");
  addList(lexical, "keyword");
  const hybrid = [...fused.values()].sort((a, b) => b.rrf - a.rrf).slice(0, k);

  return { query, backend, queryXY: placePoint(qVec, index.chunks), semantic, lexical, hybrid };
}
