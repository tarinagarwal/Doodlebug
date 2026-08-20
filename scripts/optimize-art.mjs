// Resizes the illustration assets down to roughly 2x their largest on-page display size.
//
// gpt-image-1 returns large squares; hero.webp was 1200px wide for a slot that is never
// bigger than 320px, so most of those bytes were downloaded and thrown away. 2x keeps
// retina screens sharp.
//
// Usage: node scripts/optimize-art.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ART = path.join("public", "art");

// name -> target width (2x the largest rendered size on any page)
const TARGETS = {
  hero: 640, // rendered at max-w-[320px]
  mascot: 320, // rendered at 150px and 120px
  empty: 360, // rendered at 180px
  // auth (700px for a 352px slot) and notfound (520px for 260px) are already about right
};

for (const [name, width] of Object.entries(TARGETS)) {
  const file = path.join(ART, `${name}.webp`);
  if (!fs.existsSync(file)) {
    console.error("missing", file);
    continue;
  }
  // Everything works off one buffer. On Windows sharp keeps a handle open for as long as it
  // is reading a path -- including for metadata() -- so writing back to that same path fails.
  const input = fs.readFileSync(file);
  const before = input.length;
  const meta = await sharp(input).metadata();
  if ((meta.width ?? 0) <= width) {
    console.log(`${name}: already ${meta.width}px, skipping`);
    continue;
  }
  const output = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toBuffer();
  fs.writeFileSync(file, output);
  const after = fs.statSync(file).size;
  console.log(`${name}: ${meta.width}px ${(before / 1024).toFixed(0)}KB -> ${width}px ${(after / 1024).toFixed(0)}KB`);
}
