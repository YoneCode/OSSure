// Hand-drawn SVG decorations. These deliberately use jittery, non-uniform paths
// and dasharrays so the marks read as sketched rather than vectorized.

type CommonProps = { className?: string; stroke?: string; strokeWidth?: number };

export function ArrowDashed({ className = "", stroke = "#2d5da1", strokeWidth = 3 }: CommonProps) {
  // A wobbly arrow drawn with a dashed path that ends in a hand-shaky head.
  return (
    <svg viewBox="0 0 220 120" className={className} aria-hidden>
      <path
        d="M 8 14 C 60 8, 120 30, 180 80"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="6 7"
      />
      <path
        d="M 168 56 L 184 84 L 154 84"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SquiggleConnector({ className = "", stroke = "#2d2d2d", strokeWidth = 3 }: CommonProps) {
  // Long horizontal squiggle to connect "How It Works" steps.
  return (
    <svg viewBox="0 0 600 60" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        d="M 4 30 Q 50 4, 100 30 T 200 30 T 300 30 T 400 30 T 500 30 T 596 30"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="2 6"
      />
    </svg>
  );
}

export function CornerMarks({ className = "", stroke = "#2d2d2d", strokeWidth = 3 }: CommonProps) {
  // Photographer-style corner frame marks for the hero diagram.
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden>
      {/* top-left */}
      <path d="M 4 22 L 4 4 L 22 4" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* top-right */}
      <path d="M 78 4 L 96 4 L 96 22" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* bottom-left */}
      <path d="M 4 78 L 4 96 L 22 96" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* bottom-right */}
      <path d="M 78 96 L 96 96 L 96 78" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function DashedCircleHL({ className = "", stroke = "#ff4d4d", strokeWidth = 3 }: CommonProps) {
  // Highlighted-with-a-pen overlay (slightly squashed circle, dashed).
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden>
      <ellipse
        cx="100"
        cy="60"
        rx="92"
        ry="52"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray="4 7"
        transform="rotate(-3 100 60)"
      />
    </svg>
  );
}

export function SquiggleDivider({ className = "", stroke = "#2d2d2d", strokeWidth = 2 }: CommonProps) {
  // Full-width sketchy divider, replaces straight border-t lines.
  return (
    <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        d="M 4 12 Q 60 2, 120 12 T 240 12 T 360 12 T 480 12 T 600 12 T 720 12 T 840 12 T 960 12 T 1080 12 T 1196 12"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarBurst({ className = "", stroke = "#ff4d4d", strokeWidth = 3 }: CommonProps) {
  // Tiny scribble/sparkle accent for emphasis points.
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
        <line x1="20" y1="4" x2="20" y2="14" />
        <line x1="20" y1="26" x2="20" y2="36" />
        <line x1="4" y1="20" x2="14" y2="20" />
        <line x1="26" y1="20" x2="36" y2="20" />
        <line x1="9" y1="9" x2="15" y2="15" />
        <line x1="25" y1="25" x2="31" y2="31" />
        <line x1="9" y1="31" x2="15" y2="25" />
        <line x1="25" y1="15" x2="31" y2="9" />
      </g>
    </svg>
  );
}
