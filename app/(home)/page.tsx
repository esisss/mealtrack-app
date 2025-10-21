import { FAQ } from "@/components/ui/faq";
import { Hero } from "@/components/ui/hero";
import { Pricing } from "@/components/ui/pricing";
import { TestimonialCarousel } from "@/components/ui/testimonial-carousel";

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <TestimonialCarousel />
      <Pricing />
      <FAQ />
    </div>
  );
}
