export type CardTone = "default" | "yellow" | "muted";

const TONE_CLASSES: Record<CardTone, string> = {
  default: "border-2 border-red-100 bg-white",
  yellow: "border-2 border-yellow-300 bg-yellow-50",
  muted: "border-2 border-ink/10 bg-paper-100",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  interactive?: boolean;
  padded?: boolean;
}

export function Card({ tone = "default", interactive = false, padded = true, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl shadow-soft transition ${TONE_CLASSES[tone]} ${padded ? "p-4" : ""} ${
        interactive ? "hover:-translate-y-1 hover:shadow-card" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
