'use client'

import { markConsumptionAction } from "@/app/actions/consumptionactions"
import { RecipeSelect } from "@/types"
import { CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"


export const MarkConsumption = ({
    nextMeal,
    mealPlanEntryId,
    userId,
    stockStatus
}: {
    nextMeal: RecipeSelect,
    mealPlanEntryId: string,
    userId: string,
    stockStatus: {
        hasEnoughStock: boolean;
        missingIngredients: { name: string; required: number; inStock: number }[];
    }
}) => {
    const markConsumption = async () => {
        if (confirm(`Are you sure you want to mark "${nextMeal.name}" as consumed?`)) {
            const result = await markConsumptionAction(userId, mealPlanEntryId)
            if (!result.success) {
                alert('Failed to mark consumption')
            }
        }
    }
    if (!nextMeal) {
        return (
            <div className="w-full sm:w-164 h-72 bg-sidebar rounded-lg p-2 flex flex-row">
                <div className="flex flex-col justify-center items-center w-full">
                    <h2 className="text-lg font-semibold">No meal found for this week</h2>
                    <p className="text-sm text-muted-foreground">Create a new meal plan to get started here</p>
                    <Link href="/planner"><button className="cursor-pointer mt-4 px-4 py-2 bg-primary text-sm text-primary-foreground rounded-lg uppercase font-bold">Add meal</button></Link>
                </div>
            </div>
        )
    }
    return (
        <div className="w-full sm:w-164 h-o sm:h-72 bg-sidebar rounded-lg p-2 flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-1/3 h-32 sm:h-full mr-0 sm:mr-4 mb-2 sm:mb-0 shrink-0">
                <Image
                    className="rounded-lg object-cover"
                    src="https://gourmet.iprospect.cl/wp-content/uploads/2016/12/Carbonara-editada.jpg"
                    alt="Carbonara"
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                />
            </div>
            <div className="flex flex-col w-full">
                <p className="text-sm font-semibold text-muted-foreground">Next Meal</p>
                <p className="text-xl">{nextMeal.name}</p>
                <p className="text-sm text-muted-foreground h-full">{nextMeal.notes}</p>

                {stockStatus.hasEnoughStock ? (
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
                            You need more {stockStatus.missingIngredients.map(i => i.name).join(", ")} to prepare this.
                        </p>
                        <Link href="/pantry" className="text-xs font-bold underline">
                            Go to Grocery List
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
