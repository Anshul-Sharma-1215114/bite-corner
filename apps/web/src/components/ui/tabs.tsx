// Underline-style tab strip for category filters — the active tab gets a
// bold red underline instead of a filled pill background.
interface TabItem {
  key: string;
  label: string;
}

export function Tabs({
  items,
  active,
  onChange,
  className = "",
}: {
  items: TabItem[];
  active: string | null;
  onChange: (key: string | null) => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-6 overflow-x-auto ${className}`}>
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key === "__all__" ? null : item.key)}
            className={`shrink-0 whitespace-nowrap border-b-2 pb-2 text-sm font-bold uppercase tracking-wide transition ${
              isActive ? "border-red-500 text-red-600" : "border-transparent text-ink/40 hover:text-ink/70"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
