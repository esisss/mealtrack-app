import Link from "next/link";
import { Button } from "./button";

export const Hero = () => {
  return (
    <div className="min-h-[clamp(10rem,15rem,20rem)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-center mt-20 md:mt-40">
            <h1 className="text-5xl text-mute md:text-6xl lg:text-7xl font-bold mb-4">
              Plan <strong className="text-primary">Meals</strong> <br /> Shop{" "}
              <strong className="text-primary">Smarter</strong> <br /> Spend{" "}
              <strong className="text-primary">Less</strong>
            </h1>

            <div className="mt-6 lg:mt-12 flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/signin">
                <Button
                  size="lg"
                  className="text-muted-foreground"
                  variant="outline"
                >
                  Browse Recipes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
