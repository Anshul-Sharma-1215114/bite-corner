import { Flame } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-500 to-red-600 pb-16 pt-10 sm:pt-16">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-yellow-400/20" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-yellow-400/10" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-ink shadow-soft">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" /> Hot &amp; fresh, every order
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Italian &amp; Chinese, <span className="text-yellow-300">fast.</span>
            </h1>
            <p className="mt-4 text-base text-white/90 sm:text-lg">
              Wood-fired pizzas, sizzling wok classics, and everything in between — ordered in seconds, delivered hot.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              <ButtonLink href="/menu" variant="secondary" size="lg">
                Order Now
              </ButtonLink>
              <ButtonLink href="/combos" size="lg" className="!bg-white !text-red-600 hover:!bg-yellow-50">
                See Combos
              </ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto flex h-56 w-56 items-center justify-center rounded-full bg-yellow-400 shadow-lifted sm:h-72 sm:w-72">
            <span className="animate-wiggle text-7xl sm:text-8xl">🍕</span>
          </div>
        </div>
      </div>
    </section>
  );
}
