/** The two headphone-wearing bits, connected by a sound wave. */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size * 2.1}
      height={size}
      viewBox="0 0 210 100"
      className={className}
      role="img"
      aria-label="Two Bits Apart logo"
    >
      {/* blue bit */}
      <circle cx="62" cy="56" r="36" fill="var(--blue)" />
      <path d="M22 50 A40 40 0 0 1 102 50" fill="none" stroke="#e9edf5" strokeWidth="5" strokeLinecap="round" />
      <rect x="16" y="44" width="13" height="28" rx="4" fill="#e9edf5" />
      <rect x="95" y="44" width="13" height="28" rx="4" fill="#e9edf5" />
      <rect x="50" y="49" width="8" height="8" fill="#ffffff" />
      <rect x="66" y="49" width="8" height="8" fill="#ffffff" />
      {/* purple bit */}
      <circle cx="148" cy="56" r="36" fill="var(--purple)" />
      <path d="M108 50 A40 40 0 0 1 188 50" fill="none" stroke="#e9edf5" strokeWidth="5" strokeLinecap="round" />
      <rect x="102" y="44" width="13" height="28" rx="4" fill="#e9edf5" />
      <rect x="181" y="44" width="13" height="28" rx="4" fill="#e9edf5" />
      <rect x="136" y="49" width="8" height="8" fill="#0b0f19" />
      <rect x="152" y="49" width="8" height="8" fill="#0b0f19" />
      {/* the wave between them */}
      <polyline
        points="78,84 94,84 100,72 106,98 112,64 118,90 122,84 134,84"
        fill="none"
        stroke="#e9edf5"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display tracking-[0.18em] uppercase ${className}`}>
      Two <b className="text-gradient font-bold">Bits</b> Apart
    </span>
  );
}
