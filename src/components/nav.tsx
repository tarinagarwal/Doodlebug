import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Mascot, Icon } from "./doodles";
import { LogoutButton } from "./logout-button";
import { MobileMenu } from "./mobile-menu";
export { Footer } from "./footer";

export async function Nav() {
  const user = await getCurrentUser();
  return (
    <header className="border-b-[2.5px] border-ink bg-paper/90 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 wiggle">
          <Mascot size={38} className="shrink-0 sm:hidden" />
          <Mascot size={44} className="hidden shrink-0 sm:block" />
          <span className="title-hand truncate text-2xl leading-none sm:text-3xl">Doodlebug</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-[1.02rem] md:gap-2">
          {/*
            Desktop-only links live behind a wrapper rather than carrying `hidden` themselves.
            `.btn` sets its own display, so a `hidden` utility on the button loses the cascade
            and the link stays visible on phones — which is exactly what used to happen here.
          */}
          <div className="hidden items-center gap-1 sm:flex md:gap-2">
            <Link href="/docs" className="btn btn-ghost btn-sm">
              Docs
            </Link>
            <Link href="/themes" className="btn btn-ghost btn-sm">
              Themes
            </Link>
            <a href="https://github.com/tarinagarwal/Doodlebug" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" aria-label="GitHub">
              <Icon name="github" size={18} /> <span className="hidden md:inline">GitHub</span>
            </a>
          </div>

          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                <Icon name="cards" size={16} /> Dashboard
              </Link>
              <div className="hidden sm:flex">
                <LogoutButton />
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-1 sm:flex md:gap-2">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}

          <MobileMenu loggedIn={Boolean(user)} name={user?.name ?? null} />
        </nav>
      </div>
    </header>
  );
}
