import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

/**
 * TEMPORARY bisection endpoint for the "Bad flags." failure coming out of @vercel/og.
 * Each variant adds one ingredient so the offending one can be identified in a single deploy.
 * Delete once /api/og is healthy.
 */
export const runtime = "edge";

async function font(origin: string, file: string): Promise<ArrayBuffer> {
  const res = await fetch(new URL(`/fonts/${file}`, origin));
  if (!res.ok) throw new Error(`${file} -> ${res.status}`);
  return res.arrayBuffer();
}

export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get("v") ?? "1";
  const origin = req.nextUrl.origin;

  try {
    // 1: absolute minimum — no custom fonts, no styling beyond a solid background
    if (v === "1") {
      return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#fdf8ec", display: "flex", fontSize: 60 }}>hello</div>, {
        width: 600,
        height: 315,
      });
    }

    // 2: Patrick Hand only
    if (v === "2") {
      const patrick = await font(origin, "patrickhand.ttf");
      return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#fdf8ec", display: "flex", fontSize: 60, fontFamily: "P" }}>hello</div>, {
        width: 600,
        height: 315,
        fonts: [{ name: "P", data: patrick, weight: 400, style: "normal" }],
      });
    }

    // 3: Caveat only
    if (v === "3") {
      const caveat = await font(origin, "caveat-bold.ttf");
      return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#fdf8ec", display: "flex", fontSize: 60, fontFamily: "C" }}>hello</div>, {
        width: 600,
        height: 315,
        fonts: [{ name: "C", data: caveat, weight: 700, style: "normal" }],
      });
    }

    // 4: no fonts, but the layout features the real card uses
    if (v === "4") {
      return new ImageResponse(
        (
          <div style={{ width: "100%", height: "100%", background: "#fdf8ec", display: "flex", flexDirection: "column", padding: 40 }}>
            <div
              style={{
                display: "flex",
                flex: 1,
                border: "6px solid #2b2b2b",
                borderRadius: 34,
                background: "#fffdf7",
                boxShadow: "14px 14px 0 rgba(43,43,43,0.22)",
                padding: "38px 46px",
                fontSize: 40,
              }}
            >
              layout only
            </div>
          </div>
        ),
        { width: 600, height: 315 },
      );
    }

    // 5: no fonts, but the exact copy — em dash, middot, apostrophes
    if (v === "5") {
      return new ImageResponse(
        (
          <div style={{ width: "100%", height: "100%", background: "#fdf8ec", display: "flex", fontSize: 30, padding: 20 }}>
            doodlebug.tarinagarwal.in · free · open source — no token required
          </div>
        ),
        { width: 600, height: 315 },
      );
    }

    // 6: no fonts, inline svg child
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", background: "#fdf8ec", display: "flex", fontSize: 30 }}>
          <svg width="52" height="52" viewBox="0 0 24 24">
            <path d="M12 2.6 L14.8 8.4 L21.2 9.3 L16.5 13.9 L17.8 20.8 L12 17.5 L6.1 20.8 L7.4 13.9 L2.7 9.3 L9.1 8.4 Z" fill="#f7b32b" stroke="#2b2b2b" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      { width: 600, height: 315 },
    );
  } catch (e) {
    return new Response(`variant ${v} THREW: ${(e as Error).message}`, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
}
