// Pre-renders the social preview images into public/og/pages/.
//
// They are served as static files rather than from /api/og because a cold render of that
// route takes seconds and WhatsApp's crawler abandons the fetch, producing a preview with a
// title and no image. A file on the CDN has no such problem.
//
// Usage: start the app (`pnpm build && pnpm start`, or `pnpm dev`) and run:
//   node scripts/gen-og.mjs [baseUrl]
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = path.join("public", "og", "pages");
const pages = JSON.parse(fs.readFileSync(path.join("src", "lib", "og-pages.json"), "utf8"));

fs.mkdirSync(OUT, { recursive: true });

let failed = 0;
for (const [key, cfg] of Object.entries(pages)) {
  const url = `${BASE}/api/og?${new URLSearchParams({ title: cfg.title, subtitle: cfg.subtitle, art: cfg.art })}`;
  process.stdout.write(`${key.padEnd(9)} `);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    // A render that fails inside satori still returns 200 with an empty stream, so check.
    if (buf.length < 5000 || buf.subarray(1, 4).toString() !== "PNG") {
      throw new Error(`bad image (${buf.length} bytes)`);
    }
    fs.writeFileSync(path.join(OUT, `${key}.png`), buf);
    console.log(`ok  ${(buf.length / 1024).toFixed(0)}KB`);
  } catch (e) {
    failed++;
    console.log(`FAILED: ${e.message}`);
  }
}

if (failed) {
  console.error(`\n${failed} image(s) failed`);
  process.exit(1);
}
console.log(`\nwrote ${Object.keys(pages).length} images to ${OUT}`);
