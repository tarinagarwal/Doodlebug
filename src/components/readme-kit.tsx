"use client";

import { useState } from "react";
import { THEMES } from "@/lib/cards/theme";
import { CopyButton, Select, cx } from "./ui";

/** One-click README block using several cards at once. */
export function ReadmeKit({ username, theme: initialTheme, origin, name }: { username: string; theme: string; origin: string; name: string }) {
  const [theme, setTheme] = useState(THEMES[initialTheme] ? initialTheme : "paper");
  const [open, setOpen] = useState(false);
  const t = theme === "paper" ? "" : `&theme=${theme}`;
  const t0 = theme === "paper" ? "" : `?theme=${theme}`;
  const u = `${origin}/api/card`;
  const gh = `https://github.com/${username}`;
  const md = `<div align="center">

<a href="${gh}"><img src="${u}/banner?username=${username}${t}" alt="${name}" width="100%"/></a>

<a href="${gh}"><img src="${u}/stats?username=${username}${t}&show=followers" alt="GitHub stats" height="195"/></a>
<a href="${gh}"><img src="${u}/streak?username=${username}${t}" alt="Streak" height="195"/></a>

<a href="${gh}"><img src="${u}/langs?username=${username}${t}&layout=donut&langs_count=6" alt="Top languages" height="200"/></a>
<a href="${gh}"><img src="${u}/graph?username=${username}${t}&days=45" alt="Activity" height="200"/></a>

<a href="${gh}"><img src="${u}/trophies?username=${username}${t}" alt="Trophies"/></a>

<a href="${gh}"><img src="${u}/activity?username=${username}${t}&weeks=40" alt="Contribution doodle"/></a>

<sub>cards by <a href="${origin}">Doodlebug</a> ✎</sub>

</div>`;
  const kitPreview = [`${u}/banner?username=${username}${t}`, `${u}/stats?username=${username}${t}&show=followers`, `${u}/streak?username=${username}${t}`, `${u}/langs?username=${username}${t}&layout=donut`, `${u}/trophies?username=${username}${t}&columns=7`];
  void t0;

  return (
    <section className="mt-10">
      <div className="sketch-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="title-hand text-3xl">README starter kit</h2>
            <p className="text-ink-soft">A ready-made block with banner, stats, streak, languages, graph, trophies and heatmap.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-44">
              {Object.values(THEMES).map((th) => (
                <option key={th.key} value={th.key}>
                  {th.label}
                </option>
              ))}
            </Select>
            <CopyButton text={md} variant="primary" label="Copy README block" />
            <button type="button" className="btn btn-sm" onClick={() => setOpen((o) => !o)}>
              {open ? "Hide" : "Preview"}
            </button>
          </div>
        </div>
        <div className={cx("mt-4 grid gap-3 sm:grid-cols-2", !open && "hidden")}>
          {kitPreview.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="preview" className="h-auto w-full first:sm:col-span-2" loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}
