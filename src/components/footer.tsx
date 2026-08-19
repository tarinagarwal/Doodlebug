"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mascot } from "./doodles";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  return (
    <footer className="mt-20 border-t-[2.5px] border-dashed border-ink/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center text-muted md:flex-row md:text-left">
        <div className="flex items-center gap-2">
          <Mascot size={34} />
          <span>
            Doodlebug — hand-drawn GitHub stats. Open source, MIT licensed. A{" "}
            <a className="underline-squiggle text-ink" href="https://devsbazaar.com" target="_blank" rel="noreferrer">
              DevsBazaar
            </a>{" "}
            product, made with a wobbly pen by{" "}
            <a className="underline-squiggle text-ink" href="https://github.com/tarinagarwal" target="_blank" rel="noreferrer">
              Tarin Agarwal
            </a>
            .
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/docs" className="hover:text-ink">
            Docs
          </Link>
          <a href="https://github.com/tarinagarwal/Doodlebug" className="hover:text-ink" target="_blank" rel="noreferrer">
            Source
          </a>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
