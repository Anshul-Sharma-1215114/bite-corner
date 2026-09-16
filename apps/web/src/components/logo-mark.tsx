// Bite Corner brand mark — a serving-cloche silhouette on the red/gold
// badge from the shop's menu board. Inline SVG so it scales cleanly at
// any size with zero extra image assets.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#B91C1C" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#FFC72C" strokeWidth="3" />
      {/* Steam curl */}
      <path
        d="M32 14c-2.2 2-2.2 3.6 0 5.6s2.2 3.6 0 5.6"
        fill="none"
        stroke="#FFC72C"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Cloche dome */}
      <path
        d="M15 40c0-9.4 7.6-17 17-17s17 7.6 17 17H15z"
        fill="#FFFDF7"
      />
      <circle cx="32" cy="24.5" r="2.6" fill="#FFFDF7" />
      {/* Serving plate */}
      <rect x="11" y="40" width="42" height="5.5" rx="2.75" fill="#FFC72C" />
    </svg>
  );
}
