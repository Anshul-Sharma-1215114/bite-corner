export type IconButtonVariant = "solid" | "ghost" | "outline";
export type IconButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  solid: "bg-red-500 text-white hover:bg-red-600 shadow-soft",
  ghost: "text-ink/60 hover:bg-red-50",
  outline: "border-2 border-red-200 text-red-600 hover:bg-red-50",
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export function IconButton({ icon, label, variant = "ghost", size = "md", className = "", ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
