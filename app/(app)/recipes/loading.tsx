import { Loader } from "@/components/ui/loader";

export default function Loading() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="loader"><Loader /></div>
        </div>
    );
}