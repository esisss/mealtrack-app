'use client'

import { markConsumptionAction } from "@/app/actions/consumptionactions"
import { RecipeSelect } from "@/types"
import { CheckCircle, AlertCircle, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { startTransition, useOptimistic, useState } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"


export const MarkConsumption = ({
    todayMeals,
    userId
}: {
    todayMeals: {
        id: string;
        recipeId: string;
        recipeName: string | null;
        imageUrl: string | null;
        notes: string | null;
        mealType: string;
        done: boolean;
        stockStatus: {
            hasEnoughStock: boolean;
            missingIngredients: { name: string; required: number; inStock: number }[];
        };
    }[];
    userId: string;
}) => {
    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        type: "confirm" | "alert";
        title: string;
        description: string;
        onConfirm?: () => void;
    }>({
        isOpen: false,
        type: "confirm",
        title: "",
        description: "",
    });

    const [optimisticMeals, setOptimisticMeals] = useOptimistic(
        todayMeals,
        (current, mealIdToMarkAsDone: string) =>
            current.map(meal => meal.id === mealIdToMarkAsDone ? { ...meal, done: true } : meal)
    );

    const nextMealData = optimisticMeals.find(meal => !meal.done);

    const handleMarkConsumption = async () => {
        if (!nextMealData) return;

        startTransition(async () => {
            setOptimisticMeals(nextMealData.id);
            const result = await markConsumptionAction(userId, nextMealData.id)
            if (!result.success) {
                setDialog({
                    isOpen: true,
                    type: "alert",
                    title: "Error",
                    description: "Failed to mark consumption",
                });
            }
        });
    }

    const markConsumption = () => {
        setDialog({
            isOpen: true,
            type: "confirm",
            title: "Mark Consumption",
            description: `Are you sure you want to mark "${nextMealData?.recipeName}" as consumed?`,
            onConfirm: handleMarkConsumption,
        });
    }

    if (!nextMealData) {
        return (
            <div className="my-2">
                <h2 className="text-xl font-semibold mb-4"><CheckCircle className="text-primary inline" size={22} /> Complete your next meal</h2>
                <div className="w-full sm:h-72 bg-sidebar rounded-lg p-2 flex flex-row">
                    <div className="flex flex-col justify-center items-center w-full">
                        <h2 className="text-lg font-semibold">No more meals for today!</h2>
                        <p className="text-sm text-muted-foreground">You&apos;ve completed all your planned meals for today.</p>
                        <Link href="/planner"><button className="cursor-pointer mt-4 px-4 py-2 bg-primary text-sm text-primary-foreground rounded-lg uppercase font-bold">Plan more meals</button></Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="my-2">
            <h2 className="text-xl font-semibold mb-4"><CheckCircle className="text-primary inline" size={22} /> Complete your next meal</h2>
            <div className="w-full sm:w-full sm:h-72 bg-sidebar rounded-lg p-2 flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-1/3 h-32 sm:h-full mr-0 sm:mr-4 mb-2 sm:mb-0 shrink-0">
                    <Image
                        className="rounded-lg object-cover"
                        src={nextMealData.imageUrl ? nextMealData.imageUrl : "https://gourmet.iprospect.cl/wp-content/uploads/2016/12/Carbonara-editada.jpg"}
                        alt={nextMealData.recipeName || "Meal"}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                    />
                </div>
                <div className="flex flex-col w-full">
                    <p className="text-sm font-semibold text-muted-foreground uppercase">{nextMealData.mealType} - Next Meal</p>
                    <p className="text-xl">{nextMealData.recipeName}</p>
                    <p className="text-sm text-muted-foreground h-full">{nextMealData.notes}</p>

                    {nextMealData.stockStatus.hasEnoughStock ? (
                        <button
                            className="cursor-pointer mt-4 px-4 py-2 font-bold bg-primary text-primary-foreground rounded-lg w-full mx-auto flex items-center justify-center gap-2"
                            onClick={markConsumption}
                        >
                            Mark as consumed <CheckCircle size={18} />
                        </button>
                    ) : (
                        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg flex flex-col gap-2">
                            <div className="flex items-center gap-2 font-semibold">
                                <AlertCircle size={18} />
                                <span>Missing ingredients in stock</span>
                            </div>
                            <p className="text-xs">
                                You need more {nextMealData.stockStatus.missingIngredients.map(i => i.name).join(", ")} to prepare this.
                            </p>
                            <Link href="/pantry" className="text-xs font-bold underline">
                                Go to Grocery List
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationDialog
                isOpen={dialog.isOpen}
                type={dialog.type}
                title={dialog.title}
                description={dialog.description}
                onConfirm={dialog.onConfirm}
                onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
                variant={dialog.type === "confirm" || dialog.type === "alert" && dialog.title === "Error" ? "destructive" : "default"}
            />
        </div>
    )
}
