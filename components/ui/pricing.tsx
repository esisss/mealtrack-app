import Link from "next/link";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

export const PRICING_PLANS = [
  {
    name: "Free Forever",
    price: "$0",
    tagline: "Planning meals shouldn't cost more than the groceries.",
    features: [
      "Unlimited recipes",
      "Unlimited weekly plans",
      "Unlimited grocery lists",
      "Unlimited spending regrets",
      "Mobile & desktop friendly",
      "No ads, no upsells, no 'Pro' button",
    ],
    cta: "Get Started — It's Free (really, forever)",
    highlight: true,
  },
  {
    name: "Still Free",
    price: "$0",
    tagline: "Wait… did you think we'd charge?",
    features: [
      "Same as above",
      "Just worded slightly differently",
      "Because designers like three cards in a grid",
      "Seriously, it's free",
    ],
    cta: "Sign Up Now — Still Free",
    highlight: false,
  },
  {
    name: "Free++",
    price: "$0",
    tagline: "The premiumest free plan.",
    features: [
      "Priority support from… yourself",
      "Early access to features that don't exist yet",
      "Dark mode (okay, that one is real)",
      "The warm glow of using a portfolio project",
    ],
    cta: "Join the Free-mium Revolution",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section className="w-full bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              No hidden fees, no credit card required. Everything you need to
              plan your meals and save money.
            </p>
          </div>
        </div>

        <div className="grid gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, index) => (
            <Card
              key={plan.name}
              className={cn(
                "flex flex-col h-full transition-all hover:shadow-lg",
                plan.highlight && "border-2 border-primary"
              )}
            >
              <CardHeader
                className={cn("pb-2", plan.highlight ? "bg-primary/5" : "")}
              >
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <div className="text-4xl font-bold">{plan.price}</div>
                </div>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4 flex items-center justify-center">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className={cn(
                      "w-full",
                      plan.highlight
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Need help deciding? We're here to help you choose the right plan for
            your needs.
          </p>
        </div>
      </div>
    </section>
  );
}
