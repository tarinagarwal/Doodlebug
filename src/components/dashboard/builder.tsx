"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CARD_META, isCardType, type CardMeta, type CardType, type Control } from "@/lib/cards/meta";
import { THEMES } from "@/lib/cards/theme";
import type { SavedCardDTO } from "@/lib/saved";
import { Icon, Loader } from "../doodles";
import { Alert, Button, CopyButton, Input, Select, Textarea, api, cx } from "../ui";

interface Props {
  username: string;
  defaultTheme: string;
  origin: string;
  hasToken: boolean;
}

type Params = Record<string, string>;
const COLOR_KEYS = ["bg", "ink", "accent", "accent2", "muted"] as const;
const DATA_TYPES = new Set(["stats", "langs", "streak", "activity", "graph", "trophies", "repo"]);

/* ---------------- helpers ---------------- */

function defaultsFor(meta: CardMeta, username: string, theme: string): Params {
  const p: Params = {};
  if (DATA_TYPES.has(meta.type) || meta.type === "banner" || meta.type === "project") p.username = username;
  if (theme && theme !== "paper") p.theme = theme;
  return p;
}

export function paramsToQuery(meta: CardMeta, params: Params): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k.startsWith("_") || v === undefined || v === null || v === "") continue;
    if (k === "username" && !(DATA_TYPES.has(meta.type) || meta.type === "banner" || meta.type === "project")) continue;
    if (k === "theme" && v === "paper") continue;
    sp.set(k, v);
  }
  return sp.toString();
}

function queryToParams(q: string): Params {
  const out: Params = {};
  new URLSearchParams(q).forEach((v, k) => (out[k] = v));
  return out;
}

function ctrlValue(c: Control, params: Params): string | boolean | number | string[] {
  const raw = params[c.key];
  switch (c.kind) {
    case "toggle":
      return raw === undefined ? c.def : !["false", "0", "no", "off"].includes(raw.toLowerCase());
    case "number":
      return raw === undefined || raw === "" ? c.def : Number(raw);
    case "select":
      return raw ?? c.def;
    case "multi":
      return raw ? raw.split(",").filter(Boolean) : [];
    default:
      return raw ?? "";
  }
}

/* ---------------- component ---------------- */

export function Builder({ username: accountUser, defaultTheme, origin, hasToken }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const typeParam = sp.get("type") || "stats";
  const type: CardType = isCardType(typeParam) ? typeParam : "stats";
  const meta = CARD_META.find((m) => m.type === type)!;
  const editId = sp.get("edit");

  const [params, setParams] = useState<Params>(() => defaultsFor(meta, accountUser, defaultTheme));
  const [cardName, setCardName] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [tab, setTab] = useState<"md" | "html" | "url">("md");
  const [loading, setLoading] = useState(true);
  const [showColors, setShowColors] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [editing, setEditing] = useState<SavedCardDTO | null>(null);
  const lastType = useRef(type);

  // reset when the card type changes (via sidebar)
  useEffect(() => {
    if (lastType.current !== type) {
      lastType.current = type;
      setParams(defaultsFor(meta, accountUser, defaultTheme));
      setEditing(null);
      setCardName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // load a saved card for editing
  useEffect(() => {
    if (!editId) {
      setEditing(null);
      return;
    }
    let cancelled = false;
    api<{ card: SavedCardDTO }>(`/api/cards/${editId}`)
      .then(({ card }) => {
        if (cancelled) return;
        if (card.type !== type) {
          router.replace(`/dashboard?type=${card.type}&edit=${card.id}`);
          return;
        }
        setEditing(card);
        setParams(queryToParams(card.params));
        setCardName(card.name);
      })
      .catch((e: Error) => setToast({ kind: "error", text: e.message }));
    return () => {
      cancelled = true;
    };
  }, [editId, type, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const set = useCallback((key: string, value: string | undefined) => {
    setParams((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "") delete next[key];
      else next[key] = value;
      return next;
    });
  }, []);

  const query = useMemo(() => paramsToQuery(meta, params), [meta, params]);
  const url = `${origin}/api/card/${type}${query ? "?" + query : ""}`;
  const relative = `/api/card/${type}${query ? "?" + query : ""}`;

  // debounced preview
  const [previewUrl, setPreviewUrl] = useState(relative);
  useEffect(() => {
    const t = setTimeout(() => {
      setPreviewUrl(relative);
      setLoading(true);
    }, 400);
    return () => clearTimeout(t);
  }, [relative]);

  const theme = params.theme || "paper";
  const username = params.username ?? "";
  const target = params._href || (username ? `https://github.com/${username}` : "https://github.com");
  const alt = `${meta.label} card`;
  const md = `[![${alt}](${url})](${target})`;
  const html = `<a href="${target}"><img src="${url}" alt="${alt}" /></a>`;
  const snippet = tab === "md" ? md : tab === "html" ? html : url;

  const applyPreset = (p: Record<string, string>) => {
    const base = defaultsFor(meta, accountUser, defaultTheme);
    setParams({ ...base, ...p });
    setToast({ kind: "success", text: "Preset applied — tweak anything below." });
  };

  const randomTheme = () => {
    const keys = Object.keys(THEMES).filter((k) => k !== theme);
    set("theme", keys[Math.floor(Math.random() * keys.length)]);
    set("seed", Math.random().toString(36).slice(2, 7));
  };

  async function save(asNew = false) {
    const name = cardName.trim() || `${meta.label} · ${theme}`;
    setSaving(true);
    try {
      if (editing && !asNew) {
        const r = await api<{ card: SavedCardDTO }>(`/api/cards/${editing.id}`, { method: "PUT", json: { name, params: query, type } });
        setEditing(r.card);
        setToast({ kind: "success", text: "Card updated." });
      } else {
        const r = await api<{ card: SavedCardDTO }>("/api/cards", { method: "POST", json: { name, params: query, type } });
        setEditing(r.card);
        router.replace(`/dashboard?type=${type}&edit=${r.card.id}`);
        setToast({ kind: "success", text: "Saved to My cards." });
      }
      setSaveOpen(false);
      router.refresh();
    } catch (e) {
      setToast({ kind: "error", text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  const contentControls = meta.controls.filter((c) => (c.group ?? (c.kind === "text" || c.kind === "number" || c.kind === "select" ? "content" : "display")) === "content" && c.key !== "repo");
  const displayControls = meta.controls.filter((c) => (c.group ?? (c.kind === "toggle" || c.kind === "multi" ? "display" : "content")) === "display");
  const styleControls = meta.controls.filter((c) => c.group === "style");
  const repoControl = meta.controls.find((c) => c.key === "repo");
  const needsUser = DATA_TYPES.has(type) || type === "banner" || type === "project";

  return (
    <div>
      {/* ---------- header ---------- */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink bg-accent shadow-[2px_2px_0_#2b2b2b]">
              <Icon name={meta.icon} size={20} />
            </span>
            <h1 className="title-hand text-3xl sm:text-4xl md:text-5xl">{meta.label}</h1>
            {editing ? <span className="sketch-flat bg-[#cfe9e5] px-2 py-0.5 text-sm">editing “{editing.name}”</span> : null}
          </div>
          <p className="mt-1 text-ink-soft">{meta.help}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton text={md} variant="primary" label="Copy markdown" />
          <div className="relative">
            <Button type="button" variant="secondary" onClick={() => setSaveOpen((o) => !o)}>
              <Icon name="save" size={16} /> {editing ? "Update" : "Save card"}
            </Button>
            {saveOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-72 sketch p-3">
                <label className="label">Card name</label>
                <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder={`${meta.label} · ${theme}`} maxLength={60} autoFocus />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="primary" loading={saving} onClick={() => save(false)}>
                    {editing ? "Update" : "Save"}
                  </Button>
                  {editing ? (
                    <Button type="button" size="sm" loading={saving} onClick={() => save(true)}>
                      Save as new
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="ghost" onClick={() => setSaveOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {toast ? <Alert kind={toast.kind} className="mb-4">{toast.text}</Alert> : null}

      {/* ---------- presets ---------- */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Quick start:</span>
        {meta.presets.map((p) => (
          <button key={p.label} type="button" onClick={() => applyPreset(p.params)} className="sketch-flat bg-[#fffdf7] px-2.5 py-1 text-sm hover:bg-[#fff3cf]">
            {p.label}
          </button>
        ))}
        <button type="button" onClick={randomTheme} className="sketch-flat flex items-center gap-1 bg-[#ffd6e6] px-2.5 py-1 text-sm hover:bg-[#ffc4db]" title="Random theme + wobble">
          <Icon name="dice" size={14} /> Surprise me
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* ---------- preview column ---------- */}
        <div className="min-w-0 lg:sticky lg:top-[84px] lg:self-start">
          <div className="sketch relative overflow-hidden p-3 md:p-4">
            <div className="checker absolute inset-2 rounded-lg opacity-60" />
            <div className="relative flex min-h-[160px] items-center justify-center py-3">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader size={36} />
                </div>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={previewUrl} src={previewUrl} alt="Card preview" className={cx("h-auto max-w-full transition-opacity", loading ? "opacity-30" : "opacity-100")} onLoad={() => setLoading(false)} onError={() => setLoading(false)} />
            </div>
            <div className="relative mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
              <span>Live preview — exactly what GitHub will show.</span>
              <a href={previewUrl} target="_blank" rel="noreferrer" className="btn btn-sm">
                <Icon name="external" size={15} /> Open
              </a>
            </div>
          </div>

          <div className="mt-4 sketch-2 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {(["md", "html", "url"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setTab(k)} className={cx("sketch-flat px-3 py-1 text-[0.95rem]", tab === k ? "bg-accent-2 text-white" : "bg-[#fffdf7] hover:bg-[#e6f4f2]")}>
                  {k === "md" ? "Markdown" : k === "html" ? "HTML" : "Image URL"}
                </button>
              ))}
              <div className="ml-auto">
                <CopyButton text={snippet} variant="primary" label="Copy" />
              </div>
            </div>
            <pre className="code max-h-36 whitespace-pre-wrap break-all">{snippet}</pre>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label className="label">When someone clicks the card, open…</label>
                <Input value={params._href ?? ""} onChange={(e) => set("_href", e.target.value)} placeholder={target} />
              </div>
              <button type="button" className="btn btn-sm mb-0.5" onClick={() => setShowHelp((h) => !h)}>
                <Icon name="info" size={15} /> How do I add this to my README?
              </button>
            </div>
            {showHelp ? (
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-[0.95rem] text-ink-soft">
                <li>
                  On GitHub, create a repository named exactly your username (
                  <a className="underline-squiggle" href={`https://github.com/new?name=${username || accountUser}`} target="_blank" rel="noreferrer">
                    github.com/new
                  </a>
                  ) — GitHub shows its README on your profile.
                </li>
                <li>
                  Open its <code className="code">README.md</code>, click the pencil to edit, and paste the snippet above.
                </li>
                <li>Commit. The card appears immediately and refreshes itself every ~30 minutes.</li>
                <li>
                  Want a whole page in one go? Use the{" "}
                  <Link href="/dashboard/kit" className="underline-squiggle">
                    README starter kit
                  </Link>
                  .
                </li>
              </ol>
            ) : null}
          </div>
        </div>

        {/* ---------- options column ---------- */}
        <div className="flex min-w-0 flex-col gap-4">
          {needsUser ? (
            <Section n={1} title={type === "banner" || type === "project" ? "Whose GitHub? (optional)" : "Whose GitHub?"} hint={hasToken && username.toLowerCase() === accountUser.toLowerCase() ? "Using your saved token ✓ — private counts included." : "Public data. Any GitHub username works."}>
              <div className="flex gap-2">
                <Input value={username} onChange={(e) => set("username", e.target.value.trim())} placeholder="octocat" spellCheck={false} />
                {username !== accountUser ? (
                  <Button type="button" size="sm" onClick={() => set("username", accountUser)} title="Back to my account">
                    me
                  </Button>
                ) : null}
              </div>
              {repoControl ? (
                <div className="mt-3">
                  <label className="label">{repoControl.label}</label>
                  <Input value={(params.repo as string) ?? ""} onChange={(e) => set("repo", e.target.value.trim())} placeholder={"placeholder" in repoControl ? repoControl.placeholder : ""} spellCheck={false} />
                  {"hint" in repoControl && repoControl.hint ? <div className="mt-1 text-sm text-muted">{repoControl.hint}</div> : null}
                </div>
              ) : null}
            </Section>
          ) : null}

          {contentControls.length ? (
            <Section n={needsUser ? 2 : 1} title="What it says" hint="Fill in what you want on the card. Empty fields use sensible defaults.">
              {contentControls.map((c) => (
                <ControlField key={c.key} c={c} value={ctrlValue(c, params)} onChange={(v) => set(c.key, v)} />
              ))}
            </Section>
          ) : null}

          <Section n={(needsUser ? 2 : 1) + (contentControls.length ? 1 : 0)} title="How it looks" hint="Pick a theme. Every card type works with every theme.">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  title={t.label}
                  onClick={() => set("theme", t.key === "paper" ? undefined : t.key)}
                  className={cx("group flex flex-col items-center gap-1 rounded-lg p-1 transition", theme === t.key ? "bg-[#fff3cf]" : "hover:bg-[#fff8e6]")}
                >
                  <span className={cx("relative block h-9 w-full rounded-md border-2 transition", theme === t.key ? "border-ink shadow-[2px_2px_0_#2b2b2b]" : "border-ink/30 group-hover:border-ink")} style={{ background: t.bg }}>
                    <span className="absolute left-1 top-1 h-2.5 w-2.5 rounded-full" style={{ background: t.accent }} />
                    <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full" style={{ background: t.accent2 }} />
                  </span>
                  <span className="text-[11px] leading-none text-ink-soft">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="label">Paper pattern</label>
                <Select value={params.grid ?? ""} onChange={(e) => set("grid", e.target.value || undefined)}>
                  <option value="">theme default</option>
                  <option value="none">plain</option>
                  <option value="dots">dots</option>
                  <option value="lines">ruled lines</option>
                  <option value="grid">graph paper</option>
                </Select>
              </div>
              <div>
                <label className="label">Wobble</label>
                <div className="flex gap-2">
                  <Input value={params.seed ?? ""} onChange={(e) => set("seed", e.target.value || undefined)} placeholder="auto" />
                  <Button type="button" size="sm" onClick={() => set("seed", Math.random().toString(36).slice(2, 7))} title="Re-roll the wobble">
                    <Icon name="refresh" size={16} />
                  </Button>
                </div>
              </div>
            </div>
            <button type="button" className="mt-3 text-sm underline-squiggle" onClick={() => setShowColors((s) => !s)}>
              {showColors ? "Hide colour overrides" : "Advanced: override colours"}
            </button>
            {showColors ? (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {COLOR_KEYS.map((k) => (
                  <label key={k} className="text-xs text-muted">
                    {k}
                    <input type="color" className="mt-1 h-8 w-full cursor-pointer rounded border-2 border-ink/40 bg-transparent" value={params[k] ? "#" + params[k] : THEMES[theme][k]} onChange={(e) => set(k, e.target.value.replace("#", ""))} />
                  </label>
                ))}
                <button
                  type="button"
                  className="col-span-5 text-left text-xs underline-squiggle"
                  onClick={() => setParams((p) => {
                    const n = { ...p };
                    for (const k of COLOR_KEYS) delete n[k];
                    return n;
                  })}
                >
                  reset colours
                </button>
              </div>
            ) : null}
          </Section>

          {displayControls.length ? (
            <Section title="Show / hide" hint="Toggle rows, columns and extras.">
              {displayControls.map((c) => (
                <ControlField key={c.key} c={c} value={ctrlValue(c, params)} onChange={(v) => set(c.key, v)} />
              ))}
            </Section>
          ) : null}

          {styleControls.length ? (
            <Section title="Finishing touches" collapsible>
              {styleControls.map((c) => (
                <ControlField key={c.key} c={c} value={ctrlValue(c, params)} onChange={(v) => set(c.key, v)} />
              ))}
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------------- section + control widgets ---------------- */

function Section({ n, title, hint, children, collapsible }: { n?: number; title: string; hint?: string; children: React.ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <section className="sketch-3 p-4">
      <button type="button" className={cx("flex w-full items-center gap-2 text-left", !collapsible && "cursor-default")} onClick={() => collapsible && setOpen((o) => !o)}>
        {n !== undefined ? <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-accent title-hand text-lg">{n}</span> : null}
        <span className="title-hand text-2xl">{title}</span>
        {collapsible ? <Icon name={open ? "chevronDown" : "chevronRight"} size={18} className="ml-auto" /> : null}
      </button>
      {hint && open ? <p className="mb-3 mt-1 text-sm text-muted">{hint}</p> : null}
      {open ? <div className={cx(!hint && "mt-3")}>{children}</div> : null}
    </section>
  );
}

function ControlField({ c, value, onChange }: { c: Control; value: string | boolean | number | string[]; onChange: (v: string | undefined) => void }) {
  switch (c.kind) {
    case "text":
      return (
        <div className="mb-3">
          <label className="label">{c.label}</label>
          {c.multiline ? (
            <Textarea
              value={c.key === "items" ? ((value as string) ?? "").replace(/;/g, "\n") : ((value as string) ?? "")}
              onChange={(e) => onChange((c.key === "items" ? e.target.value.replace(/\n/g, ";") : e.target.value.replace(/\n/g, " ")) || undefined)}
              placeholder={c.placeholder}
              maxLength={c.max}
              rows={c.key === "items" ? 5 : 3}
            />
          ) : (
            <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || undefined)} placeholder={c.placeholder} maxLength={c.max} />
          )}
          {c.hint ? <div className="mt-1 text-sm text-muted">{c.hint}</div> : null}
        </div>
      );
    case "number":
      return (
        <div className="mb-3">
          <label className="label">
            {c.label} <span className="text-muted">({c.min}–{c.max})</span>
          </label>
          <div className="flex items-center gap-3">
            <input type="range" min={c.min} max={c.max} value={value as number} onChange={(e) => onChange(Number(e.target.value) === c.def ? undefined : e.target.value)} className="w-full accent-[#2a9d8f]" />
            <span className="w-12 text-right title-hand text-xl">{value as number}</span>
          </div>
          {c.hint ? <div className="mt-1 text-sm text-muted">{c.hint}</div> : null}
        </div>
      );
    case "select":
      return (
        <div className="mb-3">
          <label className="label">{c.label}</label>
          <div className="flex flex-wrap gap-2">
            {c.options.map((o) => (
              <button key={o.value} type="button" onClick={() => onChange(o.value === c.def ? undefined : o.value)} className={cx("sketch-flat px-2.5 py-1 text-sm", value === o.value ? "bg-accent" : "bg-[#fffdf7] hover:bg-[#fff3cf]")}>
                {o.label}
              </button>
            ))}
          </div>
          {c.hint ? <div className="mt-1 text-sm text-muted">{c.hint}</div> : null}
        </div>
      );
    case "toggle": {
      const on = Boolean(value);
      return (
        <label className="mb-2.5 flex cursor-pointer items-center justify-between gap-3">
          <span>{c.label}</span>
          <span
            role="switch"
            aria-checked={on}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onChange(!on === c.def ? undefined : String(!on));
              }
            }}
            onClick={() => onChange(!on === c.def ? undefined : String(!on))}
            className={cx("relative inline-block h-7 w-12 shrink-0 rounded-full border-[2.5px] border-ink transition", on ? "bg-accent-2" : "bg-[#eee8da]")}
          >
            <span className={cx("absolute top-0.5 h-5 w-5 rounded-full border-2 border-ink bg-[#fffdf7] transition-all", on ? "left-[22px]" : "left-0.5")} />
          </span>
        </label>
      );
    }
    case "multi": {
      const arr = value as string[];
      return (
        <div className="mb-3">
          <div className="label">{c.label}</div>
          <div className="flex flex-wrap gap-2">
            {c.options.map((o) => {
              const sel = arr.includes(o.value);
              return (
                <button key={o.value} type="button" onClick={() => onChange((sel ? arr.filter((x) => x !== o.value) : [...arr, o.value]).join(",") || undefined)} className={cx("sketch-flat px-2.5 py-0.5 text-sm", sel ? "bg-accent" : "bg-[#fffdf7] hover:bg-[#fff3cf]")}>
                  {sel ? "✓ " : ""}
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
