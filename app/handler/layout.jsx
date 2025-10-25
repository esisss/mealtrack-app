import Link from "next/link";

export default function AuthHandlerLayout({ children }) {
  return (
    <section>
      <Link href="/">
        <h2 className="text-xl font-bold italic m-4">
          Meal<strong className="text-primary">Wise</strong>
        </h2>
      </Link>

      {children}
      <footer className="w-full py-6 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-8">
          <p className="text-sm text-muted-foreground">
            Built by{" "}
            <Link
              href="https://github.com/esisss/mealtrack-app"
              className="font-medium underline underline-offset-4"
            >
              @esisss
            </Link>
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/esisss"
              target="_blank"
              rel="noreferrer"
            >
              <GitHubLogoIcon className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/jesus-esis-93945b170/"
              target="_blank"
              rel="noreferrer"
            >
              <LinkedInLogoIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </footer>
    </section>
  );
}
