"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import { QuoteIcon } from "@radix-ui/react-icons";
import Image from "next/image";

const TESTIMONIALS = [
  {
    id: 1,
    text: "Cut my planning time in half — no more buying onions twice!",
    author: "Maya R.",
  },
  {
    id: 2,
    text: "Planner + spend tracker revealed my takeout leaks.",
    author: "Omar P.",
  },
  {
    id: 3,
    text: "Plan a week in 10 minutes; list exports to my phone.",
    author: "Sofia M.",
  },
  {
    id: 4,
    text: "Saved me money in the first month — weekly totals = clarity.",
    author: "Daniel K.",
  },
  {
    id: 5,
    text: "Batch-cooking Sundays made easy — ingredient scaling works.",
    author: "Ava T.",
  },
  {
    id: 6,
    text: "Portfolio-quality app — nice demo for testing before signup.",
    author: "Liam O.",
  },
  {
    id: 7,
    text: "Shopping with a toddler is finally doable.",
    author: "Isabella R.",
  },
  {
    id: 8,
    text: "Perfect for organizing recipe experiments.",
    author: "Mateo S.",
  },
  {
    id: 9,
    text: "“Love the privacy-first, no-ads design.”",
    author: "Nora J.",
  },
  {
    id: 10,
    text: "Fits my busy schedule — excited for nutrition fields.",
    author: "Ethan B.",
  },
];

export function TestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    inViewThreshold: 0.7,
  });

  const slideStyles = `
    .embla__slide {
      flex: 0 0 100%;
      min-width: 0;
      padding: 0 0.5rem;
    }
    
    @media (min-width: 768px) {
      .embla__slide {
        flex: 0 0 calc(100% / 3);
      }
    }
  `;

  // Auto-scroll functionality
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 my-10">
      <style jsx global>
        {slideStyles}
      </style>

      {/* svh estable para evitar saltos por barra de navegador */}
      <div className="overflow-hidden p-1" ref={emblaRef}>
        <div className="flex embla__container items-stretch">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="embla__slide px-3 py-8 min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
            >
              <div className="h-full flex flex-col bg-card rounded-lg p-6 shadow-sm relative">
                <QuoteIcon className="absolute top-2 left-2 w-6 h-6 text-primary/70 rotate-180" />
                <blockquote className="text-base sm:text-lg font-medium text-foreground/90 leading-relaxed px-4 py-2 text-center mb-4 flex-grow">
                  {t.text}
                </blockquote>
                <footer className="mt-auto pt-4 flex flex-col items-center border-t border-border/50">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-primary/20 shadow-sm">
                    <Image
                      width={200}
                      height={200}
                      src={`https://picsum.photos/seed/${t.author}/200/200`}
                      alt={t.author}
                      className=" object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-base font-medium text-foreground">
                    {t.author}
                  </p>
                </footer>
                <QuoteIcon className="absolute bottom-2 right-2 w-6 h-6 text-primary/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
