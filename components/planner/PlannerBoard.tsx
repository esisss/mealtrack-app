'use client';

import { MealCycleSelect, MealPlanEntrySelect, RecipeSelect } from '@/types';
import { DayColumn } from './DayColumn';
import { startTransition, Suspense, useOptimistic, useState } from 'react';
import toast from 'react-hot-toast';
import { addMealPlanEntryAction, removeMealPlanEntryAction } from '@/app/actions/planneractions';
import { DayIndicator } from '../pantry/grocery/DayIndicator';
import { parseLocalDate, formatLocalDate, getTodayLocal, isBeforeToday } from '@/lib/date-utils';

interface PlannerBoardProps {
    cycle: MealCycleSelect;
    entries: (MealPlanEntrySelect & { recipeName: string | null })[];
    recipes: RecipeSelect[];
    userId: string;
}

type OptimisticEntry = MealPlanEntrySelect & { recipeName: string | null };

type OptimisticAction =
    | { type: 'add'; entry: OptimisticEntry }
    | { type: 'remove'; entryId: string };

export function PlannerBoard({ cycle, entries, recipes, userId }: PlannerBoardProps) {
    const startDate = parseLocalDate(cycle.startDate);
    const [selectedDay, setSelectedDay] = useState<Date>(getTodayLocal());

    const handleDayClick = (day: Date) => {
        setSelectedDay(day);
    }

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
                }, userId);
                toast.success('Entry added successfully');

            } catch (error) {
                console.error('Failed to add entry', error);
                toast.error('Failed to add entry');
                // useOptimistic will automatically rollback on error
            }
        })
    };
    const dayStr = formatLocalDate(selectedDay);
    const dayEntries = optimisticEntries.filter((e) => {
        return e.day === dayStr;
    });


    const handleRemoveEntry = async (entryId: string) => {
        startTransition(async () => {
            // Optimistic update - instant UI feedback
            addOptimisticUpdate({ type: 'remove', entryId });

            try {
                await removeMealPlanEntryAction(entryId, cycle.id, userId);
                toast.success('Entry removed successfully');
            } catch (error) {
                console.error('Failed to remove entry', error);
                toast.error('Failed to remove entry');
                // useOptimistic will automatically rollback on error
            }
        });
    };

    return (
        <div>
            <div className="flex flex-row justify-between items-center sm:px-4">

                <div className="flex flex-col justify-between items-start">
                    <h2 className="text-2xl font-bold tracking-tight text-left">Week Plan</h2>
                    <div className="text-sm text-muted-foreground text-left">
                        {startDate.toLocaleDateString()} -{' '}
                        {new Date(cycle.endDate).toLocaleDateString()}
                    </div>
                    <DayIndicator onDayClick={handleDayClick} days={days} selectedDay={selectedDay} />
                </div>
            </div>


            <div className="flex gap-4 justify-between min-w-max">
                <DayColumn
                    key={selectedDay?.toISOString()}
                    day={selectedDay}
                    entries={dayEntries}
                    recipes={recipes}
                    onAddEntry={(recipeId, mealType) =>
                        handleAddEntry(selectedDay, recipeId, mealType)
                    }
                    onRemoveEntry={handleRemoveEntry}
                    isEditable={!isBeforeToday(selectedDay)}
                />
            </div>
        </div>
    )
}