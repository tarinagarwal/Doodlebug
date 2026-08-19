"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./doodles";
import { cx } from "./ui";

interface Props {
  loggedIn: boolean;
  /** shown as a header inside the panel so it is obvious which account is open */
  name?: string | null;
}

/**
 * Small-screen navigation. The header only has room for the logo and one or two buttons, so
 * everything else lives in here rather than being hidden with `sm:inline-flex` and becoming
 * unreachable — which is what used to happen to Docs and Settings on a phone.
 */
export function MobileMenu({ loggedIn, name }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Any navigation closes the panel.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    // Stop the page scrolling behind the open panel.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const link = (href: string, icon: string, label: string, external = false) => {
    const active = !external && (pathname === href || (href !== "/" && pathname?.startsWith(href)));
    const cls = cx(
      "flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-[1.05rem]",
      active ? "border-ink bg-accent shadow-[2px_2px_0_#2b2b2b]" : "border-transparent hover:border-ink/40 hover:bg-[#fff8e6]",
    );
    const inner = (
      <>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-ink/30 bg-[#fffdf7]">
          <Icon name={icon} size={16} />
        </span>
        {label}
      </>
    );
    return external ? (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  };

  return (
    <div className="sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-ghost btn-sm px-2"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="db-mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={open ? "x" : "menu"} size={22} />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 top-[62px] z-40 bg-ink/25" aria-hidden="true" />
          <div
            id="db-mobile-menu"
            ref={panelRef}
            className="fixed inset-x-0 top-[62px] z-50 max-h-[calc(100dvh-62px)] overflow-y-auto border-b-[2.5px] border-ink bg-paper px-4 pb-6 pt-4 shadow-[0_6px_0_rgba(43,43,43,0.15)]"
          >
            {loggedIn && name ? <div className="mb-3 px-1 text-sm text-muted">Signed in as {name}</div> : null}
            <div className="flex flex-col gap-1">
              {loggedIn ? (
                <>
                  {link("/dashboard", "cards", "Dashboard")}
                  {link("/dashboard/cards", "save", "My cards")}
                  {link("/dashboard/kit", "sparkles", "README starter kit")}
                  {link("/dashboard/settings", "sliders", "Settings")}
                </>
              ) : null}
              {link("/docs", "book", "Docs")}
              {link("/themes", "palette", "Themes")}
              {link("https://github.com/tarinagarwal/Doodlebug", "github", "GitHub", true)}
            </div>

            <div className="mt-4 border-t-2 border-dashed border-ink/30 pt-4">
              {loggedIn ? (
                <button
                  type="button"
                  className="btn btn-danger w-full"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    await fetch("/api/auth/logout", { method: "POST" });
                    setOpen(false);
                    router.push("/");
                    router.refresh();
                  }}
                >
                  <Icon name="logout" size={18} /> Log out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="btn w-full">
                    Log in
                  </Link>
                  <Link href="/signup" className="btn btn-primary w-full">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
