import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <header className="mb-8 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-64" />
                </div>
                {/* QuickActions Skeleton */}
                <div className="flex gap-6">
                    <Skeleton className="h-32 w-72" />
                    <Skeleton className="h-32 w-72" />
                    <Skeleton className="h-32 w-72" />
                    <Skeleton className="h-32 w-72" />
                </div>
            </header>

            <div className="flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Next Meal Focus Skeleton */}
                    <section className="flex-2 min-w-[300px] w-full h-full lg:w-auto space-y-6">
                        {/* MarkConsumption Skeleton */}
                        <div className="my-2">
                            <Skeleton className="h-8 w-48 mb-4" />
                            <div className="w-full sm:h-72 bg-sidebar rounded-lg p-2 flex flex-col sm:flex-row gap-4">
                                <Skeleton className="relative w-full sm:w-1/3 h-32 sm:h-full rounded-lg" />
                                <div className="flex flex-col w-full gap-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-10 w-full mt-auto" />
                                </div>
                            </div>
                        </div>
                        {/* CookableRecipes Skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats Column Skeleton */}
                    <div className="flex-1 flex flex-col gap-6 w-full lg:w-auto">
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <div className="p-2 rounded-2xl space-y-8 my-2">
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
