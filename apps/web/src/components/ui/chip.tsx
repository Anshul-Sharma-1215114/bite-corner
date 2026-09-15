export type ChipSize = "sm" | "md";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: ChipSize;
}

export function Chip({ active = false, size = "md", className = "", children, ...rest }: ChipProps) {
  return (
    <button
      className={`shrink-0 whitespace-nowrap rounded-full font-display font-semibold transition ${
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
      } ${active ? "bg-red-500 text-white shadow-soft" : "bg-red-50 text-red-700 hover:bg-red-100"} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
