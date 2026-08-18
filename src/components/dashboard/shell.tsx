"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CARD_META } from "@/lib/cards/meta";
import { Icon } from "../doodles";
import { cx } from "../ui";

interface Props {
  savedCount: number;
  githubUsername: string;
  hasToken: boolean;
  children: React.ReactNode;
}

const DATA_TYPES = ["stats", "langs", "streak", "activity", "graph", "trophies", "repo"];

export function DashboardShell({ savedCount, githubUsername, hasToken, children }: Props) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const activeType = pathname === "/dashboard" ? sp.get("type") || "stats" : null;

  const item = (href: string, active: boolean, icon: string, label: string, badge?: string | number) => (
    <Link
      key={href}
      href={href}
      className={cx(
        "group flex items-center gap-2.5 rounded-lg border-2 px-2.5 py-1 text-[0.95rem] leading-tight transition",
        active ? "border-ink bg-accent shadow-[2px_2px_0_#2b2b2b] -rotate-[0.6deg]" : "border-transparent hover:border-ink/40 hover:bg-[#fff8e6]",
      )}
    >
      <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2", active ? "border-ink bg-[#fffdf7]" : "border-ink/30 bg-[#fffdf7] group-hover:border-ink")}>
        <Icon name={icon} size={15} />
      </span>
      <span className="truncate">{label}</span>
      {badge !== undefined && badge !== "" ? <span className="ml-auto rounded-full border-2 border-ink/50 px-1.5 text-xs">{badge}</span> : null}
    </Link>
  );

  const fromGithub = CARD_META.filter((c) => DATA_TYPES.includes(c.type));
  const custom = CARD_META.filter((c) => !DATA_TYPES.includes(c.type));

  const sidebar = (
    <nav className="flex flex-col gap-3">
      <div className="sketch-flat bg-[#fffdf7] px-3 py-2 text-sm">
        <div className="text-muted">Drawing for</div>
        <div className="flex items-center justify-between gap-2">
          <b className="truncate">@{githubUsername || "—"}</b>
          <span className={cx("shrink-0 rounded-full border-2 px-1.5 text-xs", hasToken ? "border-ok bg-[#e6f4e9]" : "border-accent bg-[#fde9b6]")}>{hasToken ? "token ✓" : "public"}</span>
        </div>
      </div>
      <div>
        <div className="mb-1 px-1 text-xs uppercase tracking-wider text-muted">From your GitHub</div>
        <div className="flex flex-col gap-0.5">{fromGithub.map((c) => item(`/dashboard?type=${c.type}`, activeType === c.type, c.icon, c.label))}</div>
      </div>
      <div>
        <div className="mb-1 px-1 text-xs uppercase tracking-wider text-muted">Write your own</div>
        <div className="flex flex-col gap-0.5">{custom.map((c) => item(`/dashboard?type=${c.type}`, activeType === c.type, c.icon, c.label))}</div>
      </div>
      <div className="border-t-2 border-dashed border-ink/30 pt-2">
        <div className="flex flex-col gap-0.5">
          {item("/dashboard/cards", pathname === "/dashboard/cards", "save", "My cards", savedCount)}
          {item("/dashboard/kit", pathname === "/dashboard/kit", "sparkles", "README starter kit")}
          {item("/dashboard/settings", pathname === "/dashboard/settings", "sliders", "Settings")}
          {item("/docs", false, "book", "Docs")}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="mx-auto w-full max-w-[1800px] lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      {/* desktop sidebar: notebook spine */}
      <aside className="relative hidden lg:block">
        <div className="fixed top-[62px] bottom-0 w-[264px] overflow-hidden border-r-[2.5px] border-ink bg-[#fbf6ea] px-3 py-4 pl-8">
          {/* red margin line */}
          <div className="pointer-events-none absolute bottom-0 left-[22px] top-0 w-px bg-[#e5b8b8]" />
          {sidebar}
        </div>
      </aside>

      {/* mobile / tablet: horizontal strip */}
      <div className="sticky top-[62px] z-30 border-b-[2.5px] border-ink bg-[#fbf6ea]/95 backdrop-blur lg:hidden">
        <div className="flex gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:none]">
          {CARD_META.map((c) => (
            <Link key={c.type} href={`/dashboard?type=${c.type}`} className={cx("sketch-flat flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-sm", activeType === c.type ? "bg-accent" : "bg-[#fffdf7]")}>
              <Icon name={c.icon} size={14} /> {c.label}
            </Link>
          ))}
          <Link href="/dashboard/cards" className={cx("sketch-flat flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-sm", pathname === "/dashboard/cards" ? "bg-accent" : "bg-[#cfe9e5]")}>
            <Icon name="save" size={14} /> My cards ({savedCount})
          </Link>
          <Link href="/dashboard/kit" className={cx("sketch-flat flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-sm", pathname === "/dashboard/kit" ? "bg-accent" : "bg-[#fffdf7]")}>
            <Icon name="sparkles" size={14} /> Starter kit
          </Link>
          <Link href="/dashboard/settings" className={cx("sketch-flat flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-sm", pathname === "/dashboard/settings" ? "bg-accent" : "bg-[#fffdf7]")}>
            <Icon name="sliders" size={14} /> Settings
          </Link>
        </div>
      </div>

      <main className="min-w-0 px-4 py-6 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
