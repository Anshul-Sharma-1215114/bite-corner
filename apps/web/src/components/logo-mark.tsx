// Placeholder brand mark — swap for the real Bite Corner logo once the
// reference image is provided. Kept as a simple inline SVG so it scales
// cleanly at any size with zero extra assets in the meantime.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#EF3340" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#FFC72C" strokeWidth="4" strokeDasharray="6 5" />
      <text x="32" y="41" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="22" fill="#FFC72C">
        BC
      </text>
    </svg>
  );
}
