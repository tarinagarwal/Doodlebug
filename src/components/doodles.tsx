/* Hand-authored SVG doodles used across the site UI. All strokes are deliberately wobbly. */

export function Mascot({ size = 140, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="Doodlebug mascot" role="img">
      <g stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* legs */}
        <path d="M30 62 C26 66 20 70 14 74" />
        <path d="M30 70 C25 76 18 80 12 84" />
        <path d="M70 62 C74 66 80 70 86 74" />
        <path d="M70 70 C75 76 82 80 88 84" />
        <path d="M34 78 C31 84 26 88 22 92" />
        <path d="M66 78 C69 84 74 88 78 92" />
        {/* body */}
        <path d="M50 44 C64 43 74 54 73 67 C72 80 62 89 50 88 C38 89 27 80 27 67 C26 54 36 43 50 44 Z" fill="#f7b32b" strokeWidth="2.6" />
        <path d="M50 46 C51 60 50 74 50 87" strokeWidth="1.8" />
        <circle cx="38" cy="60" r="4" fill="#2b2b2b" stroke="none" />
        <circle cx="62" cy="60" r="4" fill="#2b2b2b" stroke="none" />
        <circle cx="42" cy="76" r="3" fill="#2b2b2b" stroke="none" />
        <circle cx="60" cy="78" r="3.5" fill="#2b2b2b" stroke="none" />
        {/* head */}
        <path d="M50 23 C59 22 66 30 65 39 C64 48 57 53 50 53 C42 53 35 48 35 39 C34 30 41 22 50 23 Z" fill="#fffdf7" strokeWidth="2.6" />
        {/* antennae */}
        <path d="M40 26 C37 20 34 15 28 10" />
        <path d="M60 26 C63 20 66 15 72 10" />
        <circle cx="28" cy="10" r="3" fill="#2a9d8f" strokeWidth="1.5" />
        <circle cx="72" cy="10" r="3" fill="#2a9d8f" strokeWidth="1.5" />
        {/* eyes */}
        <circle cx="43" cy="36" r="4.5" fill="#fff" strokeWidth="1.5" />
        <circle cx="57" cy="36" r="4.5" fill="#fff" strokeWidth="1.5" />
        <circle cx="44.5" cy="37" r="2" fill="#2b2b2b" stroke="none" />
        <circle cx="58.5" cy="37" r="2" fill="#2b2b2b" stroke="none" />
        {/* smile + blush */}
        <path d="M44 45 C47 48 53 48 56 45" strokeWidth="1.8" />
        <ellipse cx="38" cy="44" rx="3" ry="1.5" fill="#f7b32b" stroke="none" opacity="0.6" />
        <ellipse cx="62" cy="44" rx="3" ry="1.5" fill="#f7b32b" stroke="none" opacity="0.6" />
        {/* pencil */}
        <path d="M76 52 L96 32 L100 36 L80 56 Z" fill="#2a9d8f" strokeWidth="1.6" />
        <path d="M76 52 L80 56 L72 58 Z" fill="#f4d7b0" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

export function Sparkle({ className = "", size = 24, color = "#f7b32b" }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2 C12.6 8 14.5 10 21.5 12 C14.5 14 12.6 16 12 22 C11.4 16 9.5 14 2.5 12 C9.5 10 11.4 8 12 2 Z" fill={color} stroke="#2b2b2b" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function Star({ className = "", size = 24, color = "#f7b32b" }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2.5 L14.9 8.6 L21.5 9.4 L16.6 14 L17.9 20.6 L12 17.4 L6.1 20.6 L7.4 14 L2.5 9.4 L9.1 8.6 Z" fill={color} stroke="#2b2b2b" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Squiggle({ className = "", width = 120, color = "#2a9d8f" }: { className?: string; width?: number; color?: string }) {
  return (
    <svg width={width} height="14" viewBox="0 0 120 14" className={className} aria-hidden preserveAspectRatio="none">
      <path d="M2 8 C10 2 16 2 24 8 C32 14 38 14 46 8 C54 2 60 2 68 8 C76 14 82 14 90 8 C98 2 104 2 118 8" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Arrow({ className = "", color = "#2b2b2b", flip = false }: { className?: string; color?: string; flip?: boolean }) {
  return (
    <svg width="90" height="60" viewBox="0 0 90 60" className={className} aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M4 8 C20 40 50 52 82 44" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M70 34 L83 44 L70 54" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Heart({ className = "", size = 20, color = "#ff5da2" }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 20 C6 15 3 12 3 8.5 C3 6 5 4 7.5 4 C9.5 4 11 5 12 6.5 C13 5 14.5 4 16.5 4 C19 4 21 6 21 8.5 C21 12 18 15 12 20 Z" fill={color} stroke="#2b2b2b" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg width="120" height="70" viewBox="0 0 120 70" className={className} aria-hidden>
      <path d="M30 58 C14 58 8 46 14 38 C10 26 24 18 34 24 C38 8 62 6 70 20 C84 12 100 24 94 38 C108 40 108 58 92 58 Z" fill="#fffdf7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

export function Underline({ className = "", color = "#f7b32b" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
      <path d="M2 7 C40 3 80 3 118 6 C150 8 175 6 198 5" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function Loader({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="spin" aria-label="loading">
      <path d="M12 3 a9 9 0 1 1 -6.4 2.6" fill="none" stroke="#2b2b2b" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Small monochrome line icons for the UI (not roughened) */
export function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  const paths: Record<string, string> = {
    copy: "M9 9 H20 V20 H9 Z M4 15 V4 H15",
    check: "M5 12.5 L10 17 L19 7",
    external: "M14 4 H20 V10 M20 4 L11 13 M18 14 V20 H4 V6 H10",
    github: "M12 2 C6.5 2 2 6.5 2 12 C2 16.4 4.9 20.2 8.8 21.5 C9.3 21.6 9.5 21.3 9.5 21 V19.2 C6.7 19.8 6.1 17.9 6.1 17.9 C5.7 16.7 5 16.4 5 16.4 C4.1 15.8 5.1 15.8 5.1 15.8 C6.1 15.9 6.6 16.8 6.6 16.8 C7.5 18.3 8.9 17.9 9.5 17.6 C9.6 17 9.9 16.5 10.1 16.3 C7.9 16 5.6 15.2 5.6 11.4 C5.6 10.3 6 9.4 6.6 8.7 C6.5 8.4 6.2 7.4 6.7 6.1 C6.7 6.1 7.5 5.8 9.5 7.1 C10.3 6.9 11.2 6.8 12 6.8 C12.8 6.8 13.7 6.9 14.5 7.1 C16.5 5.8 17.3 6.1 17.3 6.1 C17.8 7.4 17.5 8.4 17.4 8.7 C18 9.4 18.4 10.3 18.4 11.4 C18.4 15.2 16.1 16 13.9 16.3 C14.2 16.6 14.5 17.2 14.5 18.1 V21 C14.5 21.3 14.7 21.6 15.2 21.5 C19.1 20.2 22 16.4 22 12 C22 6.5 17.5 2 12 2 Z",
    logout: "M10 4 H4 V20 H10 M15 8 L20 12 L15 16 M8 12 H20",
    settings: "M12 8 a4 4 0 1 0 0.01 0 M12 2.5 V5 M12 19 V21.5 M2.5 12 H5 M19 12 H21.5 M5.3 5.3 L7 7 M17 17 L18.7 18.7 M5.3 18.7 L7 17 M17 7 L18.7 5.3",
    cards: "M3 6 H15 V15 H3 Z M7 10 H19 V19 H7 Z",
    key: "M8 14 a4 4 0 1 0 0.01 0 M11 11 L20 3 M17 6 L19 8 M15 8 L17 10",
    user: "M12 4 a4 4 0 1 0 0.01 0 M4 21 C4 16 7.5 13.5 12 13.5 C16.5 13.5 20 16 20 21",
    refresh: "M4 12 a8 8 0 0 1 14 -5 M20 12 a8 8 0 0 1 -14 5 M18 3 V7 H14 M6 21 V17 H10",
    trash: "M4 7 H20 M9 7 V4 H15 V7 M6 7 L7 20 H17 L18 7 M10 11 V17 M14 11 V17",
    eye: "M2 12 C5 6.5 8.5 4.5 12 4.5 C15.5 4.5 19 6.5 22 12 C19 17.5 15.5 19.5 12 19.5 C8.5 19.5 5 17.5 2 12 Z M12 9 a3 3 0 1 0 0.01 0",
    menu: "M4 7 H20 M4 12 H20 M4 17 H20",
    x: "M6 6 L18 18 M18 6 L6 18",
    info: "M12 3 a9 9 0 1 0 0.01 0 M12 11 V16.5 M12 7.8 v0.2",
    bolt: "M13.5 2.5 L5 13.5 H11.5 L10.5 21.5 L19 10.5 H12.5 Z",
    lock: "M6 11 H18 V21 H6 Z M8 11 V7 A4 4 0 0 1 16 7 V11",
    mail: "M3 6 H21 V18 H3 Z M3 6 L12 13 L21 6",
    book: "M4 4 H10 C11.5 4 12 5 12 6 V20 C12 19 11.5 18 10 18 H4 Z M20 4 H14 C12.5 4 12 5 12 6 V20 C12 19 12.5 18 14 18 H20 Z",
    arrowRight: "M4 12 H20 M14 6 L20 12 L14 18",
    graph: "M3 20 H21 M3 20 V4 M6 16 L10 10 L13.5 13.5 L19 6",
    code: "M8 6 L2.5 12 L8 18 M16 6 L21.5 12 L16 18 M14 4 L10 20",
    sliders: "M4 6 H20 M4 12 H20 M4 18 H20 M9 3.5 V8.5 M15 9.5 V14.5 M7 15.5 V20.5",
    save: "M5 4 H16 L20 8 V20 H5 Z M8 4 V9 H15 V4 M8 20 V14 H16 V20",
    edit: "M4 20 L5 15.5 L16 4.5 L19.5 8 L8.5 19 Z M14 6.5 L17.5 10",
    plus: "M12 5 V19 M5 12 H19",
    chevronDown: "M6 9 L12 15 L18 9",
    chevronRight: "M9 6 L15 12 L9 18",
    home: "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z",
    sparkles: "M12 3 C12.5 8 14 10.5 19 11 C14 11.5 12.5 14 12 19 C11.5 14 10 11.5 5 11 C10 10.5 11.5 8 12 3 Z M19 15 C19.2 17 20 17.8 22 18 C20 18.2 19.2 19 19 21 C18.8 19 18 18.2 16 18 C18 17.8 18.8 17 19 15 Z",
    grid: "M4 4 H10 V10 H4 Z M14 4 H20 V10 H14 Z M4 14 H10 V20 H4 Z M14 14 H20 V20 H14 Z",
    wand: "M4 20 L14 10 M12 8 L16 12 M17 3 v2 M17 8 v2 M14.5 6.5 h-2 M21.5 6.5 h-2 M6 3 v1.5 M6 7 v1.5 M4.5 5.75 h-1 M8.5 5.75 h-1",
    dice: "M4 4 H20 V20 H4 Z M8.5 8.5 v0.2 M15.5 8.5 v0.2 M12 12 v0.2 M8.5 15.5 v0.2 M15.5 15.5 v0.2",
    palette: "M12 3 C7 3 3 7 3 12 C3 17 7 21 12 21 C13.5 21 14 20 13.5 19 C13 17.5 14 16.5 15.5 16.5 H17.5 C19.5 16.5 21 15 21 12.5 C21 7.5 17 3 12 3 Z M8 12 a1 1 0 1 0 0.01 0 M11 8 a1 1 0 1 0 0.01 0 M16 8 a1 1 0 1 0 0.01 0",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden fill={name === "github" ? "currentColor" : "none"} stroke={name === "github" ? "none" : "currentColor"} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] ?? paths.info} />
    </svg>
  );
}
