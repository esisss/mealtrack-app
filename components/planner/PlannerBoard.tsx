'use client';

import { MealCycleSelect, MealPlanEntrySelect, RecipeSelect } from '@/types';
import { DayColumn } from './DayColumn';
import { startTransition, useOptimistic } from 'react';
import toast from 'react-hot-toast';
import { addMealPlanEntryAction, removeMealPlanEntryAction } from '@/app/actions/planneractions';

interface PlannerBoardProps {
    cycle: MealCycleSelect;
    entries: (MealPlanEntrySelect & { recipeName: string | null })[];
    recipes: RecipeSelect[];
}

type OptimisticEntry = MealPlanEntrySelect & { recipeName: string | null };

type OptimisticAction =
    | { type: 'add'; entry: OptimisticEntry }
    | { type: 'remove'; entryId: string };

export function PlannerBoard({ cycle, entries, recipes }: PlannerBoardProps) {
    const startDate = new Date(cycle.startDate);

    // useOptimistic for instant UI updates
    const [optimisticEntries, addOptimisticUpdate] = useOptimistic<
        OptimisticEntry[],
        OptimisticAction
    >(entries, (state, action: OptimisticAction) => {
        if (action.type === 'add') {
            return [...state, action.entry];
        } else if (action.type === 'remove') {
            return state.filter((entry) => entry.id !== action.entryId);
        }
        return state;
    });

    // Generate array of 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return date;
    });

    const handleAddEntry = async (
        day: Date,
        recipeId: string,
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    ) => {
        startTransition(async () => {
            const recipe = recipes.find((r) => r.id === recipeId);


            // Optimistic update - instant UI feedback
            const optimisticEntry: OptimisticEntry = {
                id: crypto.randomUUID(), // Temporary ID
                cycleId: cycle.id,
                day: day.toISOString(),
                mealType,
                recipeId,
                servings: '1',
                done: false,
                recipeName: recipe?.name || null,
            }

            addOptimisticUpdate({ type: 'add', entry: optimisticEntry });

            try {
                await addMealPlanEntryAction({
                    cycleId: cycle.id,
                    day: day.toISOString(),
                    mealType,
                    recipeId,
                    servings: '1',
                });
                toast.success('Entry added successfully');

            } catch (error) {
                console.error('Failed to add entry', error);
                toast.error('Failed to add entry');
                // useOptimistic will automatically rollback on error
            }
        })
    };

    const handleRemoveEntry = async (entryId: string) => {
        startTransition(async () => {
            // Optimistic update - instant UI feedback
            addOptimisticUpdate({ type: 'remove', entryId });

            try {
                await removeMealPlanEntryAction(entryId);
                toast.success('Entry removed successfully');
            } catch (error) {
                console.error('Failed to remove entry', error);
                toast.error('Failed to remove entry');
                // useOptimistic will automatically rollback on error
            }
        });
    };

    return (
        <div className="flex flex-col justify-center gap-6 overflow-x-auto pb-4 mx-auto ">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Week Plan</h2>
                <div className="text-sm text-muted-foreground">
                    {startDate.toLocaleDateString()} -{' '}
                    {new Date(cycle.endDate).toLocaleDateString()}
                </div>
            </div>

            <div className="flex gap-4 justify-between min-w-max">
                {days.map((day) => {
                    const dayStr = day.toISOString().split('T')[0];
                    const dayEntries = optimisticEntries.filter((e) => {
                        const entryDateStr = new Date(e.day).toISOString().split('T')[0];
                        return entryDateStr === dayStr;
                    });

                    return (
                        <DayColumn
                            key={day.toISOString()}
                            day={day}
                            entries={dayEntries}
                            recipes={recipes}
                            onAddEntry={(recipeId, mealType) =>
                                handleAddEntry(day, recipeId, mealType)
                            }
                            onRemoveEntry={handleRemoveEntry}
                        />
                    );
                })}
            </div>
        </div>
    )
}