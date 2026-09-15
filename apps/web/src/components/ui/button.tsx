import Link from "next/link";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-red-500 text-white shadow-pop hover:bg-red-600 active:shadow-none active:translate-y-1",
  secondary: "bg-yellow-400 text-ink shadow-pop hover:bg-yellow-500 active:shadow-none active:translate-y-1",
  outline: "border-2 border-red-300 text-red-600 hover:bg-red-50",
  ghost: "text-ink/70 hover:bg-red-50",
  danger: "border-2 border-red-300 text-red-600 hover:bg-red-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}): string {
  return `inline-flex items-center justify-center gap-1.5 rounded-full font-display font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button disabled={disabled || loading} className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function ButtonLink({ href, variant = "primary", size = "md", fullWidth = false, className = "", children, onClick }: ButtonLinkProps) {
  return (
    <Link href={href} onClick={onClick} className={buttonClasses({ variant, size, fullWidth, className })}>
      {children}
    </Link>
  );
}
