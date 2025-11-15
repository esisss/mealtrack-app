import { recipes } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <section>
            {children}
        </section>
    );
}