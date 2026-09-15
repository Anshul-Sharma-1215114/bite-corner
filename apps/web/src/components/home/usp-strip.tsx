import { Timer, ShieldCheck, Flame, Bike, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const USPS: { Icon: LucideIcon; title: string; description: string }[] = [
  { Icon: Timer, title: "Lightning Fast", description: "Hot food at your door in record time." },
  { Icon: Flame, title: "Cooked Fresh", description: "Every order fired up only after you place it." },
  { Icon: ShieldCheck, title: "Hygienic Kitchen", description: "Clean prep, sealed packaging, every time." },
  { Icon: Bike, title: "Local Delivery", description: "Flat, low delivery fee across our zone." },
];

export function UspStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {USPS.map((usp) => (
          <Card key={usp.title} padded={false} interactive className="flex flex-col items-center gap-1.5 px-3 py-5 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
              <usp.Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-display text-sm font-bold text-ink">{usp.title}</h3>
            <p className="text-xs text-ink/60">{usp.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
