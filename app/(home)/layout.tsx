import { Navbar } from "@/components/ui/navbar";

export default function LandingPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
