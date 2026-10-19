import { search } from "./rag.js";

const query = process.argv.slice(2).join(" ") ||
  "Why is the checkout test flaky in CI (QA-1432)?";
const r = await search(query);
const show = (title, list, fmt) => {
  console.log(`\n=== ${title} ===`);
  list.forEach((x, i) => console.log(`${i + 1}. ${fmt(x)}  [${x.id}]\n   ${x.text.replace(/\s+/g, " ").slice(0, 150)}`));
};
console.log(`Query: "${query}"   (vector search: ${r.backend})`);
show("MEANING (embeddings)", r.semantic, (x) => `similarity ${x.score.toFixed(3)}`);
show("KEYWORD (BM25)", r.lexical, (x) => `bm25 ${x.score.toFixed(2)} matched: ${x.matched.join(", ")}`);
show("HYBRID (rank fusion)", r.hybrid, (x) => `rrf ${x.rrf.toFixed(4)} via ${x.via.join(" + ")}`);
