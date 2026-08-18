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
    prompt: `${STYLE} A cute friendly cartoon ladybug-beetle mascot character named Doodlebug, big curious eyes, tiny antennae, holding a pencil, drawn as a single sticker-like doodle centered on a transparent background, thick outline.`,
  },
  {
    name: "hero",
    size: "1536x1024",
    background: "opaque",
    prompt: `${STYLE} A wide sketchbook scene: a hand-drawn laptop showing a wobbly bar chart and a line graph, floating doodle stickers around it (a star, a git branch fork symbol, a tiny rocket, a coffee mug, a trophy, a heart), light dashed arrows connecting them, lots of white space, feels like a fun engineer's notebook page.`,
  },
  {
    name: "empty",
    size: "1024x1024",
    background: "transparent",
    prompt: `${STYLE} A small doodle of an open blank spiral notebook with a pencil resting on it and three little sparkles above, sticker style on transparent background.`,
  },
  {
    name: "banner-tarin",
    size: "1536x1024",
    background: "opaque",
    prompt: `${STYLE} A wide banner-shaped doodle collage for a software engineer: a laptop with code brackets, a cute cat wearing glasses reviewing paper documents, a game controller, a small chain of linked blocks, a rocket, a graduation cap, a coffee cup, stars and sparkles scattered, all as loose ink doodles with a little yellow and teal marker fill, generous white space in the center for a title to be added later.`,
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
