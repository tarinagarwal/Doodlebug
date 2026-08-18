import type { CalendarDay, UserBundle } from "../github/types";
import { Sketch } from "./draw";
import { frame } from "./frame";
import { icon } from "./icons";
import { bool, int, type CommonParams } from "./params";
import { fmtDate, fmtNum, r, text } from "./text";
import { possessive } from "./stats";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function mixHex(a: string, b: string, k: number): string {
  const pa = a.replace("#", "");
  const pb = b.replace("#", "");
  const ex = (h: string) => (h.length === 3 ? h.split("").map((c) => c + c).join("") : h);
  const A = ex(pa),
    B = ex(pb);
  const out = [0, 2, 4].map((i) => {
    const x = parseInt(A.slice(i, i + 2), 16);
    const y = parseInt(B.slice(i, i + 2), 16);
    return Math.round(x + (y - x) * k).toString(16).padStart(2, "0");
  });
  return "#" + out.join("");
}

/** Hand-drawn contribution heatmap ("activity") */
export function activityCard(b: UserBundle, sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const weeks = int(sp, "weeks", 30, 8, 53);
  const showLegend = bool(sp, "legend", true);
  const cal = b.streak.calendar;
  const days = cal.slice(-weeks * 7);
  // align so the grid ends on today's weekday column
  const first = days[0];
  const firstDow = first ? new Date(first.date + "T00:00:00Z").getUTCDay() : 0;
  const cell = 12,
    gap = 3,
    pitch = cell + gap;
  const left = 46,
    topPad = c.hideTitle ? 40 : 72;
  const cols = Math.ceil((days.length + firstDow) / 7);
  const W = Math.max(300, left + cols * pitch + 30);
  const H = topPad + 7 * pitch + 52;
  const sk = new Sketch(c.seed + 41);
  const body: string[] = [];
  const title = c.title ?? `${possessive(b.stats.name || b.stats.login)} Contribution Doodle`;
  const titleIcon = icon(sk, "calendar", 0, 0, 24, t.ink);

  const max = Math.max(1, ...days.map((d) => d.count));
  const level = (n: number): number => {
    if (n <= 0) return 0;
    const q = n / max;
    if (q <= 0.25) return 1;
    if (q <= 0.5) return 2;
    if (q <= 0.75) return 3;
    return 4;
  };
  const colors = [t.dark ? mixHex(t.bg, t.ink, 0.12) : mixHex(t.bg, t.ink, 0.08), mixHex(t.bg, t.accent2, 0.35), mixHex(t.bg, t.accent2, 0.6), mixHex(t.bg, t.accent2, 0.85), t.accent2];

  // day labels
  ["Mon", "Wed", "Fri"].forEach((d, i) => body.push(text(left - 8, topPad + (1 + i * 2) * pitch + 10, d, { size: 11, fill: t.muted, anchor: "end" })));

  // cells
  days.forEach((d: CalendarDay, i) => {
    const idx = i + firstDow;
    const col = Math.floor(idx / 7);
    const row = idx % 7;
    const x = left + col * pitch + sk.jitter(0.8);
    const y = topPad + row * pitch + sk.jitter(0.8);
    const rot = sk.jitter(5);
    const lv = level(d.count);
    body.push(
      `<rect x="${r(x)}" y="${r(y)}" width="${cell}" height="${cell}" rx="2.5" fill="${colors[lv]}" stroke="${t.ink}" stroke-opacity="${lv === 0 ? 0.18 : 0.55}" stroke-width="1" transform="rotate(${r(rot)} ${r(x + cell / 2)} ${r(y + cell / 2)})"><title>${d.date}: ${d.count} contribution${d.count === 1 ? "" : "s"}</title></rect>`,
    );
  });
  // month labels: label a column when its first day starts a new month
  let prevMonth = -1;
  for (let col = 0; col < cols; col++) {
    const i = col * 7 - firstDow; // index of the row-0 day in this column
    const d = days[Math.max(0, i)];
    if (!d) continue;
    const m = new Date(d.date + "T00:00:00Z").getUTCMonth();
    if (m !== prevMonth) {
      if (col < cols - 1 && (col > 0 || i >= 0)) body.push(text(left + col * pitch, topPad - 6, MONTHS[m], { size: 11, fill: t.muted }));
      prevMonth = m;
    }
  }

  // summary + legend
  const total = days.reduce((a, d) => a + d.count, 0);
  const summaryY = topPad + 7 * pitch + 20;
  body.push(text(left, summaryY, `${fmtNum(total)} contributions in the last ${weeks} weeks`, { size: 13, fill: t.ink }));
  if (days.length) body.push(text(left, summaryY + 16, `${fmtDate(days[0].date)} → ${fmtDate(days[days.length - 1].date)}`, { size: 11, fill: t.muted }));
  if (showLegend) {
    let lx = W - 30 - 5 * 15 - 60;
    body.push(text(lx - 6, summaryY, "less", { size: 11, fill: t.muted, anchor: "end" }));
    for (let i = 0; i < 5; i++) {
      body.push(`<rect x="${lx}" y="${summaryY - 10}" width="${cell}" height="${cell}" rx="2.5" fill="${colors[i]}" stroke="${t.ink}" stroke-opacity="0.4" stroke-width="1" transform="rotate(${r(sk.jitter(5))} ${lx + 6} ${summaryY - 4})"/>`);
      lx += 15;
    }
    body.push(text(lx + 2, summaryY, "more", { size: 11, fill: t.muted }));
  }

  return frame({ width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, bottomDoodle: false, animate: c.animate }, body.join(""));
}

/** Hand-drawn line graph of daily contributions */
export function graphCard(b: UserBundle, sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const daysN = int(sp, "days", 30, 7, 120);
  const cal = b.streak.calendar.slice(-daysN);
  const W = 495,
    H = 220;
  const sk = new Sketch(c.seed + 53);
  const body: string[] = [];
  const title = c.title ?? `${possessive(b.stats.name || b.stats.login)} Activity Graph`;
  const titleIcon = icon(sk, "graph", 0, 0, 24, t.ink);
  const left = 44,
    right = W - 24,
    top = c.hideTitle ? 30 : 62,
    bottom = H - 40;
  const max = Math.max(1, ...cal.map((d) => d.count));
  const n = Math.max(1, cal.length - 1);
  const px = (i: number) => left + ((right - left) * i) / n;
  const py = (v: number) => bottom - ((bottom - top) * v) / max;

  // axes
  body.push(sk.line(left, top - 6, left, bottom, { stroke: t.ink, strokeWidth: 1.6, roughness: 1.2, double: false }));
  body.push(sk.line(left, bottom, right + 6, bottom, { stroke: t.ink, strokeWidth: 1.6, roughness: 1.2, double: false }));
  body.push(text(left - 8, top + 4, fmtNum(max), { size: 12, fill: t.muted, anchor: "end" }));
  body.push(text(left - 8, bottom + 4, "0", { size: 12, fill: t.muted, anchor: "end" }));
  // gridline at half
  body.push(`<line x1="${left}" y1="${r(py(max / 2))}" x2="${right}" y2="${r(py(max / 2))}" stroke="${t.muted}" stroke-width="1" stroke-dasharray="2 6" opacity="0.6"/>`);

  if (cal.length > 1) {
    const pts: [number, number][] = cal.map((d, i) => [px(i), py(d.count)]);
    // area
    const area = `M${r(pts[0][0])},${bottom} ` + pts.map((p) => `L${r(p[0])},${r(p[1])}`).join(" ") + ` L${r(pts[pts.length - 1][0])},${bottom} Z`;
    body.push(sk.path(area, { stroke: "none", fill: t.accent2, fillStyle: "hachure", hachureGap: 7, fillWeight: 1.1, roughness: 1, opacity: 0.55 }));
    body.push(sk.curve(pts, { stroke: t.ink, strokeWidth: 2.2, roughness: 0.9, double: false }));
    // peak marker
    let peak = 0;
    cal.forEach((d, i) => {
      if (d.count > cal[peak].count) peak = i;
    });
    if (cal[peak].count > 0) {
      body.push(sk.circle(pts[peak][0], pts[peak][1], 10, { stroke: t.ink, strokeWidth: 1.4, fill: t.accent, fillStyle: "solid", roughness: 0.8, double: false }));
      const label = `peak: ${cal[peak].count} on ${fmtDate(cal[peak].date, false)}`;
      const nearRight = pts[peak][0] > right - 130;
      const ly = pts[peak][1] < top + 18 ? pts[peak][1] + 5 : pts[peak][1] - 12;
      body.push(text(nearRight ? pts[peak][0] - 12 : pts[peak][0] + 12, ly, label, { size: 12, fill: t.ink, anchor: nearRight ? "end" : "start" }));
    }
  }
  // x labels
  if (cal.length) {
    body.push(text(left, bottom + 20, fmtDate(cal[0].date, false), { size: 12, fill: t.muted }));
    body.push(text(right, bottom + 20, fmtDate(cal[cal.length - 1].date, false), { size: 12, fill: t.muted, anchor: "end" }));
    const total = cal.reduce((a, d) => a + d.count, 0);
    body.push(text((left + right) / 2, bottom + 20, `${fmtNum(total)} contributions · last ${cal.length} days`, { size: 12, fill: t.muted, anchor: "middle" }));
  }
  return frame({ width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, bottomDoodle: false, animate: c.animate }, body.join(""));
}
