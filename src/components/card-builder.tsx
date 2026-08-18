"use client";

import { useEffect, useMemo, useState } from "react";
import { CARD_META, type CardType, type Control } from "@/lib/cards/meta";
import { THEMES } from "@/lib/cards/theme";
import { Icon, Loader } from "./doodles";
import { Button, CopyButton, Field, Input, Select, cx } from "./ui";

interface Props {
  username: string;
  defaultTheme: string;
  origin: string;
  hasToken: boolean;
}

type Values = Record<string, string | boolean | number | string[]>;

const COLOR_KEYS = ["bg", "ink", "accent", "accent2", "muted"] as const;

function initialValues(type: CardType): Values {
  const meta = CARD_META.find((m) => m.type === type)!;
  const v: Values = {};
  for (const c of meta.controls) {
    if (c.kind === "toggle") v[c.key] = c.def;
    else if (c.kind === "number") v[c.key] = c.def;
    else if (c.kind === "select") v[c.key] = c.def;
    else if (c.kind === "multi") v[c.key] = [];
    else v[c.key] = "";
  }
  return v;
}

export function buildUrl(origin: string, type: CardType, username: string, theme: string, values: Values, colors: Record<string, string>, grid: string, seed: string): string {
  const meta = CARD_META.find((m) => m.type === type)!;
  const sp = new URLSearchParams();
  if (meta.needsUser || ((type === "banner" || type === "project") && username)) sp.set("username", username);
  if (theme && theme !== "paper") sp.set("theme", theme);
  for (const c of meta.controls) {
    const val = values[c.key];
    if (c.kind === "toggle") {
      const b = Boolean(val);
      if (b !== c.def) sp.set(c.key, b ? "true" : "false");
    } else if (c.kind === "number") {
      if (typeof val === "number" && val !== c.def) sp.set(c.key, String(val));
    } else if (c.kind === "select") {
      if (val && val !== c.def) sp.set(c.key, String(val));
    } else if (c.kind === "multi") {
      if (Array.isArray(val) && val.length) sp.set(c.key, val.join(","));
    } else if (typeof val === "string" && val.trim()) sp.set(c.key, val.trim());
  }
  for (const k of COLOR_KEYS) if (colors[k]) sp.set(k, colors[k].replace("#", ""));
  if (grid) sp.set("grid", grid);
  if (seed) sp.set("seed", seed);
  const q = sp.toString();
  return `${origin}/api/card/${type}${q ? "?" + q : ""}`;
}

export function CardBuilder({ username: initialUser, defaultTheme, origin, hasToken }: Props) {
  const [type, setType] = useState<CardType>("stats");
  const [username, setUsername] = useState(initialUser);
  const [theme, setTheme] = useState(THEMES[defaultTheme] ? defaultTheme : "paper");
  const [values, setValues] = useState<Values>(() => initialValues("stats"));
  const [colors, setColors] = useState<Record<string, string>>({});
  const [grid, setGrid] = useState("");
  const [seed, setSeed] = useState("");
  const [tab, setTab] = useState<"md" | "html" | "url">("md");
  const [loading, setLoading] = useState(true);
  const [showColors, setShowColors] = useState(false);
  const meta = CARD_META.find((m) => m.type === type)!;

  const url = useMemo(() => buildUrl(origin, type, username.trim(), theme, values, colors, grid, seed), [origin, type, username, theme, values, colors, grid, seed]);
  // debounce the preview so typing does not spam requests
  const [previewUrl, setPreviewUrl] = useState(url.replace(origin, ""));
  useEffect(() => {
    const t = setTimeout(() => {
      setPreviewUrl(url.replace(origin, "")); // relative: works in dev + prod regardless of APP_URL
      setLoading(true);
    }, 450);
    return () => clearTimeout(t);
  }, [url]);

  const alt = `${meta.label} card`;
  const md = `[![${alt}](${url})](https://github.com/${username || "tarinagarwal"})`;
  const html = `<a href="https://github.com/${username || "tarinagarwal"}"><img src="${url}" alt="${alt}" /></a>`;
  const snippet = tab === "md" ? md : tab === "html" ? html : url;

  function set(key: string, v: Values[string]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* ------------ controls ------------ */}
      <div className="space-y-5">
        <div className="sketch p-4">
          <div className="label">Card type</div>
          <div className="flex flex-wrap gap-2">
            {CARD_META.map((m) => (
              <button
                key={m.type}
                type="button"
                onClick={() => {
                  setType(m.type);
                  setValues(initialValues(m.type));
                }}
                className={cx("sketch-flat px-2.5 py-1 text-[0.95rem] transition", type === m.type ? "bg-accent shadow-[2px_2px_0_#2b2b2b]" : "bg-[#fffdf7] hover:bg-[#fff3cf]")}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">{meta.blurb}</p>
        </div>

        <div className="sketch-2 p-4">
          {(meta.needsUser || type === "banner" || type === "project") && (
            <Field label="GitHub username" hint={hasToken && username.trim().toLowerCase() === initialUser.toLowerCase() ? "Using your saved token ✓" : "Public data (no token)"}>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="octocat" spellCheck={false} />
            </Field>
          )}
          <div className="label">Theme</div>
          <div className="mb-4 grid grid-cols-7 gap-2">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.key}
                type="button"
                title={t.label}
                aria-label={t.label}
                onClick={() => setTheme(t.key)}
                className={cx("relative h-9 rounded-md border-2 transition", theme === t.key ? "border-ink shadow-[2px_2px_0_#2b2b2b] scale-105" : "border-ink/30 hover:border-ink")}
                style={{ background: t.bg }}
              >
                <span className="absolute left-1 top-1 h-2.5 w-2.5 rounded-full" style={{ background: t.accent }} />
                <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full" style={{ background: t.accent2 }} />
              </button>
            ))}
          </div>
          <div className="text-sm text-muted -mt-2 mb-3">
            {THEMES[theme]?.label} ·{" "}
            <button type="button" className="underline-squiggle" onClick={() => setShowColors((s) => !s)}>
              {showColors ? "hide colour overrides" : "override colours"}
            </button>
          </div>
          {showColors ? (
            <div className="mb-3 grid grid-cols-5 gap-2">
              {COLOR_KEYS.map((k) => (
                <label key={k} className="text-xs text-muted">
                  {k}
                  <input
                    type="color"
                    className="mt-1 h-8 w-full cursor-pointer rounded border-2 border-ink/40 bg-transparent"
                    value={colors[k] || THEMES[theme][k]}
                    onChange={(e) => setColors((c) => ({ ...c, [k]: e.target.value }))}
                  />
                </label>
              ))}
              <button type="button" className="col-span-5 text-left text-xs underline-squiggle" onClick={() => setColors({})}>
                reset colours
              </button>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Background">
              <Select value={grid} onChange={(e) => setGrid(e.target.value)}>
                <option value="">theme default</option>
                <option value="none">plain</option>
                <option value="dots">dots</option>
                <option value="lines">lines</option>
                <option value="grid">grid</option>
              </Select>
            </Field>
            <Field label="Wobble seed">
              <div className="flex gap-2">
                <Input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="auto" />
                <Button type="button" size="sm" onClick={() => setSeed(Math.random().toString(36).slice(2, 7))} title="Re-roll">
                  <Icon name="refresh" size={16} />
                </Button>
              </div>
            </Field>
          </div>
        </div>

        <div className="sketch-3 p-4">
          <div className="label mb-2">Options</div>
          {meta.controls.map((c) => (
            <ControlField key={c.key} c={c} value={values[c.key]} onChange={(v) => set(c.key, v)} />
          ))}
        </div>
      </div>

      {/* ------------ preview + snippets ------------ */}
      <div className="space-y-5">
        <div className="sketch relative min-h-[240px] overflow-hidden p-4">
          <div className="checker absolute inset-3 rounded-lg opacity-60" />
          <div className="relative flex items-center justify-center py-2">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader size={36} />
              </div>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={previewUrl} src={previewUrl} alt="Card preview" className={cx("h-auto max-w-full transition-opacity", loading ? "opacity-30" : "opacity-100")} onLoad={() => setLoading(false)} onError={() => setLoading(false)} />
          </div>
          <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
            <span>Preview is the exact SVG GitHub will render. Data refreshes every ~30 min.</span>
            <a href={previewUrl} target="_blank" rel="noreferrer" className="btn btn-sm">
              <Icon name="external" size={15} /> Open
            </a>
          </div>
        </div>

        <div className="sketch-2 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {(["md", "html", "url"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={cx("sketch-flat px-3 py-1 text-[0.95rem]", tab === k ? "bg-accent-2 text-white" : "bg-[#fffdf7] hover:bg-[#e6f4f2]")}>
                {k === "md" ? "Markdown" : k === "html" ? "HTML" : "URL"}
              </button>
            ))}
            <div className="ml-auto">
              <CopyButton text={snippet} variant="primary" label="Copy snippet" />
            </div>
          </div>
          <pre className="code max-h-40 whitespace-pre-wrap break-all">{snippet}</pre>
          <p className="mt-2 text-sm text-muted">Paste into your profile README (github.com/{username || "you"}/{username || "you"}). Card URLs are public and cached — no login is needed to view them.</p>
        </div>
      </div>
    </div>
  );
}

function ControlField({ c, value, onChange }: { c: Control; value: Values[string]; onChange: (v: Values[string]) => void }) {
  switch (c.kind) {
    case "text":
      return (
        <Field label={c.label} hint={c.hint}>
          <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={c.placeholder} maxLength={c.max} />
        </Field>
      );
    case "number":
      return (
        <Field label={c.label} hint={c.hint}>
          <Input type="number" min={c.min} max={c.max} value={(value as number) ?? c.def} onChange={(e) => onChange(Math.min(c.max, Math.max(c.min, Number(e.target.value) || c.min)))} />
        </Field>
      );
    case "select":
      return (
        <Field label={c.label} hint={c.hint}>
          <Select value={(value as string) ?? c.def} onChange={(e) => onChange(e.target.value)}>
            {c.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      );
    case "toggle":
      return (
        <label className="mb-3 flex cursor-pointer items-center justify-between gap-3">
          <span>{c.label}</span>
          <span
            role="switch"
            aria-checked={Boolean(value)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onChange(!value);
              }
            }}
            onClick={() => onChange(!value)}
            className={cx("relative inline-block h-7 w-12 rounded-full border-[2.5px] border-ink transition", value ? "bg-accent-2" : "bg-[#eee8da]")}
          >
            <span className={cx("absolute top-0.5 h-5 w-5 rounded-full border-2 border-ink bg-[#fffdf7] transition-all", value ? "left-[22px]" : "left-0.5")} />
          </span>
        </label>
      );
    case "multi": {
      const arr = (value as string[]) ?? [];
      return (
        <div className="mb-4">
          <div className="label">{c.label}</div>
          <div className="flex flex-wrap gap-2">
            {c.options.map((o) => {
              const on = arr.includes(o.value);
              return (
                <button key={o.value} type="button" onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])} className={cx("sketch-flat px-2.5 py-0.5 text-sm", on ? "bg-accent" : "bg-[#fffdf7] hover:bg-[#fff3cf]")}>
                  {on ? "✓ " : ""}
                  {o.label}
                </button>
              );
            })}
          </div>
          {c.hint ? <div className="mt-1 text-sm text-muted">{c.hint}</div> : null}
        </div>
      );
    }
  }
}
