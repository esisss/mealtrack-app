import { FAQ } from "@/components/home/faq";
import { Hero } from "@/components/home/hero";
import { Pricing } from "@/components/home/pricing";
import { TestimonialCarousel } from "@/components/home/testimonial-carousel";

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
