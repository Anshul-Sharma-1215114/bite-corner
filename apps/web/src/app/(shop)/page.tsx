import { HeroSection } from "@/components/home/hero-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { UspStrip } from "@/components/home/usp-strip";
import { PopularItemsSection } from "@/components/home/popular-items-section";
import { ComboHighlightSection } from "@/components/home/combo-highlight-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <PromoBanner />
      <UspStrip />
      <PopularItemsSection />
      <ComboHighlightSection />
      <HowItWorksSection />
      <TestimonialsSection />
    </main>
  );
}
