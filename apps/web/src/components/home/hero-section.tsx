"use client";

import { useEffect, useState } from "react";
import { Pizza, Soup, Bike, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CarouselArrows } from "@/components/ui/carousel-arrows";
import { WaveDivider } from "@/components/ui/wave-divider";

interface Slide {
  panel: "red" | "yellow" | "ink";
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  Icon: LucideIcon;
}

const SLIDES: Slide[] = [
  {
    panel: "red",
    eyebrow: "Fresh off the flame",
    title: "Italian & Chinese, made fast.",
    subtitle: "Wood-fired pizzas, sizzling wok classics, and everything in between — ordered in seconds, delivered hot.",
    primaryHref: "/menu",
    primaryLabel: "Order Now",
    secondaryHref: "/combos",
    secondaryLabel: "See Combos",
    Icon: Pizza,
  },
  {
    panel: "yellow",
    eyebrow: "Bundle & save",
    title: "Combo deals built for two.",
    subtitle: "Our signature Italian and Chinese meal combos — more food, better value, one easy order.",
    primaryHref: "/combos",
    primaryLabel: "View Combos",
    secondaryHref: "/menu",
    secondaryLabel: "Browse Menu",
    Icon: Soup,
  },
  {
    panel: "ink",
    eyebrow: "Right to your door",
    title: "Fast, local delivery.",
    subtitle: "A flat delivery fee across our zone — no surprises, no long waits, just hot food on time.",
    primaryHref: "/menu",
    primaryLabel: "Start an Order",
    secondaryHref: "/orders",
    secondaryLabel: "Track an Order",
    Icon: Bike,
  },
];

const PANEL_BG: Record<Slide["panel"], string> = {
  red: "bg-red-500",
  yellow: "bg-yellow-400",
  ink: "bg-ink",
};

const PANEL_TEXT: Record<Slide["panel"], string> = {
  red: "text-white",
  yellow: "text-ink",
  ink: "text-white",
};

// The "other half" of each slide's split panel — deliberately the next
// color in the sequence so consecutive slides never repeat the same pair.
const ACCENT_BG: Record<Slide["panel"], string> = {
  red: "bg-yellow-400",
  yellow: "bg-red-500",
  ink: "bg-red-500",
};

const ACCENT_ICON: Record<Slide["panel"], string> = {
  red: "text-ink",
  yellow: "text-white",
  ink: "text-white",
};

export function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[index];

  function goTo(next: number) {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }

  return (
    <section className={`relative overflow-hidden pt-28 transition-colors duration-500 sm:pt-32 ${PANEL_BG[slide.panel]}`}>
      {/* Fixed row height (instead of sizing to each slide's own content) so
          switching slides never shifts the page, and the arrows below stay
          pinned to the same spot instead of drifting with text length. */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 sm:h-[440px] sm:grid-cols-2 sm:items-stretch">
        <div key={`text-${index}`} className={`animate-slideFade flex h-[400px] flex-col sm:h-full ${PANEL_TEXT[slide.panel]}`}>
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center sm:items-start sm:px-10 sm:text-left">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${slide.panel === "yellow" ? "bg-ink/10" : "bg-white/15"}`}>
              {slide.eyebrow}
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{slide.title}</h1>
            <p className={`mt-4 max-w-md text-sm sm:text-base ${slide.panel === "yellow" ? "text-ink/70" : "text-white/85"}`}>{slide.subtitle}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              <ButtonLink
                href={slide.primaryHref}
                variant={slide.panel === "yellow" ? "primary" : "secondary"}
                size="lg"
              >
                {slide.primaryLabel}
              </ButtonLink>
              <ButtonLink
                href={slide.secondaryHref}
                size="lg"
                className={slide.panel === "yellow" ? "!bg-white !text-ink hover:!bg-white/90" : "!bg-transparent !text-white !border-2 !border-white/70 hover:!bg-white/10"}
              >
                {slide.secondaryLabel}
              </ButtonLink>
            </div>
          </div>
          <div className="hidden justify-start px-10 pb-8 sm:flex">
            <CarouselArrows variant={slide.panel === "yellow" ? "dark" : "light"} onPrev={() => goTo(index - 1)} onNext={() => goTo(index + 1)} />
          </div>
        </div>

        <div key={`panel-${index}`} className={`animate-slideFade relative flex h-48 items-center justify-center sm:h-full ${ACCENT_BG[slide.panel]}`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 left-10 h-48 w-48 rounded-full bg-black/5" />
          <slide.Icon className={`relative h-24 w-24 sm:h-32 sm:w-32 ${ACCENT_ICON[slide.panel]}`} strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex justify-center gap-2 pb-4 sm:hidden">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>

      {/* Filled with the page's own background (what comes right after the
          hero), not the hero's own panel color — the wave shape is cut
          FROM the hero into the next section's color, not the reverse. */}
      <WaveDivider fill="#FFFFFF" className="!h-6 -mb-px sm:!h-10" />
    </section>
  );
}
