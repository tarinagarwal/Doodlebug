export type GhErrorKind = "not_found" | "rate_limited" | "unauthorized" | "network" | "other";

export class GitHubError extends Error {
  kind: GhErrorKind;
  status: number;
  constructor(kind: GhErrorKind, message: string, status = 0) {
    super(message);
    this.kind = kind;
    this.status = status;
  }
}

const UA = "Doodlebug/1.0 (+https://github.com/tarinagarwal/Doodlebug)";

function headers(token?: string, accept = "application/vnd.github+json"): Record<string, string> {
  const h: Record<string, string> = { Accept: accept, "User-Agent": UA, "X-GitHub-Api-Version": "2022-11-28" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function classify(status: number, body: string): GitHubError {
  if (status === 404) return new GitHubError("not_found", "GitHub user or resource not found", status);
  if (status === 401) return new GitHubError("unauthorized", "GitHub token is invalid or expired", status);
  if (status === 403 || status === 429) {
    const lower = body.toLowerCase();
    if (lower.includes("rate limit") || lower.includes("abuse") || status === 429) {
      return new GitHubError("rate_limited", "GitHub API rate limit reached — try again later or add a token", status);
    }
    return new GitHubError("unauthorized", "GitHub refused the request (403)", status);
  }
  return new GitHubError("other", `GitHub API error (${status})`, status);
}

export async function ghRest<T = unknown>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `https://api.github.com${path}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: { ...headers(token), ...(init?.headers as Record<string, string> | undefined) }, cache: "no-store" });
  } catch (e) {
    throw new GitHubError("network", `Network error talking to GitHub: ${(e as Error).message}`);
  }
  if (!res.ok) throw classify(res.status, await res.text().catch(() => ""));
  return (await res.json()) as T;
}

export async function ghGraphql<T = unknown>(query: string, variables: Record<string, unknown>, token: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
  } catch (e) {
    throw new GitHubError("network", `Network error talking to GitHub: ${(e as Error).message}`);
  }
  const text = await res.text();
  if (!res.ok) throw classify(res.status, text);
  const json = JSON.parse(text) as { data?: T; errors?: { type?: string; message: string }[] };
  if (json.errors?.length) {
    const e = json.errors[0];
    if (e.type === "NOT_FOUND") throw new GitHubError("not_found", "GitHub user not found", 404);
    if (e.type === "RATE_LIMITED") throw new GitHubError("rate_limited", "GitHub GraphQL rate limit reached", 403);
    throw new GitHubError("other", e.message);
  }
  if (!json.data) throw new GitHubError("other", "Empty GraphQL response");
  return json.data;
}

/** Fetches raw HTML (used for the public contribution graph). */
export async function ghHtml(url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, cache: "no-store" });
  } catch (e) {
    throw new GitHubError("network", `Network error talking to GitHub: ${(e as Error).message}`);
  }
  if (!res.ok) throw classify(res.status, "");
  return res.text();
}
