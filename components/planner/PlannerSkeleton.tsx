import { Skeleton } from "@/components/ui/skeleton";

export const PlannerSkeleton = () => {
    return (
        <div className="container mx-auto py-2">
            <div className="flex flex-col gap-4">
                {/* Header Skeleton */}
                <div className="flex flex-row justify-between items-center sm:px-4">
                    <div className="flex flex-col justify-between items-start w-full gap-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                        {/* DayIndicator Skeleton */}
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 w-full">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <Skeleton key={i} className="h-22 w-22 shrink-0 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* DayColumn Skeleton */}
                <div className="flex gap-4 justify-between min-w-max p-2">
                    <div className="w-full flex flex-col sm:flex-row justify-between gap-4">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                            <div key={type} className="border border-dashed rounded-lg py-2 sm:w-88 min-h-[250px] bg-muted/5">
                                <div className="p-2 px-6 pb-2">
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="px-6 space-y-3">
                                    <Skeleton className="h-12 w-full rounded-md" />
                                    <Skeleton className="h-12 w-full rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
