import { Button } from "@/components/ui/button";
import { HeartCrackIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-2xl font-bold">
            <div className="flex items-center">
                404 Recipe not found
                <HeartCrackIcon className="h-6 w-6 text-primary mx-2 inline-block" />
            </div>
            <Link href="/recipes"><Button className="mt-4 cursor-pointer">Back to recipes</Button></Link>
        </div>
    )
}
