// Shrinks the generated OG artwork so /api/og can inline it instead of fetching megabytes
// per render. gpt-image-1 returns ~2.8MB 1536x1024 PNGs; the composition only ever shows the
// art at ~620px wide, so this trims roughly 95% of the weight with no visible difference.
//
// Usage: node scripts/optimize-og.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join("public", "art");
const OUT = path.join("public", "og");
const WIDTH = 620;
const NAMES = ["og-hero", "og-cards", "og-palette"];

fs.mkdirSync(OUT, { recursive: true });

for (const name of NAMES) {
  const src = path.join(SRC, `${name}.png`);
  if (!fs.existsSync(src)) {
    console.error("missing", src);
    continue;
  }
  const dst = path.join(OUT, `${name}.png`);
  await sharp(src)
    .trim({ threshold: 1 }) // drop the transparent margin the model leaves around the subject
    .resize({ width: WIDTH, withoutEnlargement: true })
    // No palette: satori cannot decode indexed PNGs and reports "Unsupported image type".
    .png({ compressionLevel: 9 })
    .toFile(dst);

  const before = fs.statSync(src).size;
  const after = fs.statSync(dst).size;
  console.log(`${name}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
}
