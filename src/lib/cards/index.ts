import { GitHubError } from "../github/client";
import { getBundle, getRepo, normalizeLogin } from "../github/service";
import { activityCard, graphCard } from "./activity";
import { bannerCard } from "./banner";
import { errorCard } from "./frame";
import { langsCard } from "./langs";
import { noteCard, skillsCard } from "./misc";
import { commonParams } from "./params";
import { repoCard } from "./repo";
import { statsCard } from "./stats";
import { streakCard } from "./streak";
import { resolveTheme } from "./theme";
import { trophiesCard } from "./trophies";

export { CARD_TYPES, CARD_META, ICON_NAMES, isCardType, type CardType, type CardMeta, type ParamDoc } from "./meta";
import type { CardType } from "./meta";

export interface RenderResult {
  svg: string;
  /** seconds the CDN/GitHub may cache the response */
  cacheSeconds: number;
  ok: boolean;
  username: string | null;
}

/**
 * Renders any card from query params. Never throws for expected failures — returns an error card instead.
 */
export async function renderCard(type: CardType, sp: URLSearchParams, opts?: { token?: string; bypassCache?: boolean }): Promise<RenderResult> {
  const theme = resolveTheme(sp);
  const rawUser = sp.get("username") || sp.get("user") || "";
  const login = rawUser ? normalizeLogin(rawUser) : null;

  // data-free cards
  if (type === "note") return { svg: noteCard(sp, commonParams(sp, "note:" + (sp.get("text") ?? ""))), cacheSeconds: 86400, ok: true, username: null };
  if (type === "skills") return { svg: skillsCard(sp, commonParams(sp, "skills:" + (sp.get("skills") ?? ""))), cacheSeconds: 86400, ok: true, username: null };
  if (type === "banner" && !login) return { svg: bannerCard(null, sp, commonParams(sp, "banner:" + (sp.get("name") ?? ""))), cacheSeconds: 86400, ok: true, username: null };

  if (!login) {
    return { svg: errorCard(theme, "Who dis?", "Add ?username=your-github-login to the URL", "e.g. /api/card/stats?username=octocat"), cacheSeconds: 60, ok: false, username: null };
  }
  const c = commonParams(sp, `${type}:${login}`);

  try {
    if (type === "repo") {
      const repoName = (sp.get("repo") || "").trim();
      if (!/^[A-Za-z0-9_.-]{1,100}$/.test(repoName)) {
        return { svg: errorCard(theme, "Which repo?", "Add &repo=name to the URL", `e.g. /api/card/repo?username=${login}&repo=my-project`), cacheSeconds: 60, ok: false, username: login };
      }
      const repo = await getRepo(login, repoName);
      return { svg: repoCard(repo, sp, c), cacheSeconds: 3600, ok: true, username: login };
    }

    const { bundle } = await getBundle(login, opts);
    switch (type) {
      case "stats":
        return { svg: statsCard(bundle, sp, c), cacheSeconds: 1800, ok: true, username: login };
      case "langs":
        return { svg: langsCard(bundle, sp, c), cacheSeconds: 3600, ok: true, username: login };
      case "streak":
        return { svg: streakCard(bundle, sp, c), cacheSeconds: 1800, ok: true, username: login };
      case "activity":
        return { svg: activityCard(bundle, sp, c), cacheSeconds: 1800, ok: true, username: login };
      case "graph":
        return { svg: graphCard(bundle, sp, c), cacheSeconds: 1800, ok: true, username: login };
      case "trophies":
        return { svg: trophiesCard(bundle, sp, c), cacheSeconds: 3600, ok: true, username: login };
      case "banner":
        return { svg: bannerCard(bundle, sp, c), cacheSeconds: 3600, ok: true, username: login };
      default:
        return { svg: errorCard(theme, "Unknown card", `No card type called "${type}"`), cacheSeconds: 60, ok: false, username: login };
    }
  } catch (e) {
    const ge = e instanceof GitHubError ? e : null;
    if (ge?.kind === "not_found") return { svg: errorCard(theme, "User not found", `GitHub doesn't know "${login}"`, "Check the spelling of ?username="), cacheSeconds: 300, ok: false, username: login };
    if (ge?.kind === "rate_limited") return { svg: errorCard(theme, "Rate limited", "GitHub is throttling public requests right now", "Log in to Doodlebug and add a token to fix this for good"), cacheSeconds: 120, ok: false, username: login };
    if (ge?.kind === "unauthorized") return { svg: errorCard(theme, "Token trouble", "The saved GitHub token was rejected", "Update it in your Doodlebug settings"), cacheSeconds: 120, ok: false, username: login };
    console.error("[card]", type, login, e);
    return { svg: errorCard(theme, "Oops, ink spilled", "Something went wrong fetching data", "Try again in a minute"), cacheSeconds: 60, ok: false, username: login };
  }
}
