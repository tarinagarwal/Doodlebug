import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Mascot, Icon } from "./doodles";
import { LogoutButton } from "./logout-button";
export { Footer } from "./footer";

export async function Nav() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b-[2.5px] border-ink bg-paper/90 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-2.5 md:px-6">
        <Link href="/" className="flex items-center gap-2 wiggle">
          <Mascot size={44} />
          <span className="title-hand text-3xl leading-none">Doodlebug</span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-2 text-[1.02rem]">
          <Link href="/docs" className="btn btn-ghost btn-sm hidden sm:inline-flex">
            Docs
          </Link>
          <a href="https://github.com/tarinagarwal/Doodlebug" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm hidden sm:inline-flex" aria-label="GitHub">
            <Icon name="github" size={18} /> <span className="hidden md:inline">GitHub</span>
          </a>
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                <Icon name="cards" size={16} /> Dashboard
              </Link>
              <Link href="/dashboard/settings" className="btn btn-ghost btn-sm hidden sm:inline-flex" aria-label="Settings">
                <Icon name="sliders" size={17} /> <span className="hidden md:inline">Settings</span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

