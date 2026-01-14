import { Skeleton } from "@/components/ui/skeleton";

export const RecipesSkeleton = () => {
    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden flex flex-col h-full bg-muted/5">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-4 space-y-4 flex flex-col h-full">
                            <div className="flex justify-between items-start gap-2">
                                <Skeleton className="h-6 w-3/4" />
                                <div className="flex gap-1 shrink-0">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-1/4" />
                            <div className="flex flex-wrap gap-2 mt-auto">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
