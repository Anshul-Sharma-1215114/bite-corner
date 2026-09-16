// A soft curved transition between two differently-colored sections
// instead of a hard rectangular edge — placed at the bottom of the
// section above, colored to match the section below.
export function WaveDivider({ fill, flip = false, className = "" }: { fill: string; flip?: boolean; className?: string }) {
  return (
    <div className={`pointer-events-none relative h-10 w-full overflow-hidden sm:h-14 ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full ${flip ? "rotate-180" : ""}`}
      >
        <path d="M0,40 C240,90 480,0 720,20 C960,40 1200,90 1440,40 L1440,80 L0,80 Z" fill={fill} />
      </svg>
    </div>
  );
}
