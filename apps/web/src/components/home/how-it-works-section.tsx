import { ClipboardList, ChefHat, Bike, PartyPopper, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const STEPS: { Icon: LucideIcon; title: string; description: string }[] = [
  { Icon: ClipboardList, title: "Pick your cravings", description: "Browse Italian, Chinese, or grab a combo." },
  { Icon: ChefHat, title: "Fired up fresh", description: "Cooking starts the moment you order." },
  { Icon: Bike, title: "Delivered hot", description: "Fast, local delivery straight to your door." },
  { Icon: PartyPopper, title: "Dig in!", description: "Rate it, love it, order again." },
];

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title="How It Works" align="center" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4 sm:gap-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative flex flex-col items-center text-center">
            {i < STEPS.length - 1 && <div className="absolute left-1/2 top-7 hidden h-0.5 w-full bg-yellow-300 sm:block" />}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-soft">
              <step.Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-display text-sm font-bold text-ink">{i + 1}. {step.title}</h3>
            <p className="mt-1 text-xs text-ink/60">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
