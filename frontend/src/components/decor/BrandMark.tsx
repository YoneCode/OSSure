// Custom OSSure mark -- wobbly hand-drawn shield with </> brackets and a red slash.
// Re-used by the Header brand and any future loading state.
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-label="OSSure logo"
      className={className}
    >
      <title>OSSure</title>
      <path
        d="M32 4 C 22 6, 13 10, 8 14 C 8 30, 11 47, 32 60 C 53 47, 56 30, 56 14 C 51 10, 42 6, 32 4 Z"
        fill="#fff9c4"
        stroke="#2d2d2d"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M22.5 26 L 16 32 L 22.5 38"
        fill="none"
        stroke="#2d2d2d"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M41.5 26 L 48 32 L 41.5 38"
        fill="none"
        stroke="#2d2d2d"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="38" y1="22" x2="26" y2="42" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
