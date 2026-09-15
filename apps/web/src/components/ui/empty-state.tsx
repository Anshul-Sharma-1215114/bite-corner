import { ButtonLink, Button } from "./button";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-1.5 py-12 text-center ${className}`}>
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-red-500">{icon}</div>
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="max-w-xs text-sm text-ink/50">{description}</p>}
      {action &&
        (action.href ? (
          <ButtonLink href={action.href} size="sm" className="mt-3">
            {action.label}
          </ButtonLink>
        ) : (
          <Button size="sm" className="mt-3" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}
