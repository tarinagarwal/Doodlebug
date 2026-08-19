// Generates hand-drawn illustration assets with the OpenAI Images API (gpt-image-1).
// Usage: OPENAI_API_KEY=... node scripts/gen-assets.mjs [name ...]
// Assets are written to public/art/. Only regenerates missing files unless --force.
import fs from "node:fs";
import path from "node:path";

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("OPENAI_API_KEY missing");
  process.exit(1);
}
const force = process.argv.includes("--force");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const STYLE =
  "Hand-drawn doodle illustration in black ink pen on white paper, sketchy imperfect wobbly linework, playful notebook doodle style, a few flat marker highlights in mustard yellow and teal, no text, no letters, no watermark.";

const ASSETS = [
  {
    name: "mascot",
    size: "1024x1024",
    background: "transparent",
    prompt: `${STYLE} A cute friendly cartoon ladybug-beetle mascot character named Doodlebug: round yellow-orange shell with black spots, big curious eyes, tiny antennae with little balls on the ends, holding a pencil in one arm, smiling. Drawn as a single sticker-like doodle centered on a transparent background, thick outline, no shadow.`,
  },
  {
    name: "hero",
    size: "1536x1024",
    background: "transparent",
    prompt: `${STYLE} A wide sketchbook scene on a transparent background: a hand-drawn open laptop showing a wobbly bar chart and a line graph, floating doodle stickers around it (a star, a git branch fork symbol, a tiny rocket, a coffee mug, a trophy, a heart), light dashed arrows connecting them, generous empty space, feels like a fun engineer's notebook page.`,
  },
  {
    name: "auth",
    size: "1024x1024",
    background: "transparent",
    prompt: `${STYLE} A friendly doodle of the same cute ladybug-beetle mascot sitting at a tiny desk writing in a notebook, a big hand-drawn key and a padlock floating beside it, an envelope with a heart flying overhead, small sparkles, sticker style on a transparent background.`,
  },
  {
    name: "empty",
    size: "1024x1024",
    background: "transparent",
    prompt: `${STYLE} A small doodle of an open blank spiral notebook with a pencil resting on it and three little sparkles above, sticker style on transparent background.`,
  },
  {
    // Social-preview artwork. Composed into 1200x630 PNGs by /api/og, so it is drawn wide
    // and kept to the right-hand side with room for the headline on the left.
    name: "og-hero",
    size: "1536x1024",
    background: "transparent",
    prompt: `${STYLE} A cheerful doodle cluster on a transparent background: the cute ladybug-beetle mascot with a yellow-orange spotted shell waving one arm while holding a fountain pen, standing next to a hand-drawn README page showing a wobbly bar chart, a small flame for a streak, a donut chart and a tiny trophy. Add a few floating sticker doodles around them — a star, a heart, a sparkle, a git branch fork. Sticker style, thick wobbly outlines, generous spacing, no text.`,
  },
  {
    name: "og-cards",
    size: "1536x1024",
    background: "transparent",
    prompt: `${STYLE} A doodle of three overlapping hand-drawn stat cards fanned out like playing cards on a transparent background: one showing a wobbly bar chart, one a donut chart, one a flame and a small calendar heatmap grid. A pencil rests diagonally across them and two sparkles float above. Sticker style, thick wobbly outlines, no text.`,
  },
  {
    name: "og-palette",
    size: "1536x1024",
    background: "transparent",
    prompt: `${STYLE} A doodle of an artist palette with blobs of mustard yellow, teal, coral pink and deep navy paint, a paintbrush and two marker pens beside it, and a small hand-drawn card swatch showing colour stripes. The cute ladybug-beetle mascot peeks over the top edge of the palette. Sticker style on transparent background, no text.`,
  },
  {
    name: "notfound",
    size: "1024x1024",
    background: "transparent",
    prompt: `${STYLE} The cute ladybug-beetle mascot looking puzzled while holding a big eraser, with a torn-out notebook page and a question mark doodle floating above, sticker style on transparent background.`,
  },
];

async function gen(a) {
  const out = path.join("public", "art", `${a.name}.png`);
  if (fs.existsSync(out) && !force) {
    console.log("skip", a.name);
    return;
  }
  console.log("generating", a.name, "...");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: a.prompt,
      size: a.size,
      quality: "medium",
      background: a.background,
      output_format: "png",
      n: 1,
    }),
  });
  if (!res.ok) {
    console.error(a.name, "failed", res.status, await res.text());
    return;
  }
  const json = await res.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    console.error(a.name, "no image in response");
    return;
  }
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  console.log("wrote", out);
}

for (const a of ASSETS) {
  if (only.length && !only.includes(a.name)) continue;
  await gen(a);
}
