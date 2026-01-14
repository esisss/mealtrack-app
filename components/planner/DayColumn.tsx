'use client';

import { MealPlanEntrySelect, RecipeSelect } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, CheckSquareIcon, Trash2 } from 'lucide-react';
import { RecipeSelector } from './RecipeSelector';
import { cn } from '@/lib/utils';

interface DayColumnProps {
    day: Date;
    entries: (MealPlanEntrySelect & { recipeName: string | null })[];
    recipes: RecipeSelect[];
    onAddEntry: (recipeId: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
    onRemoveEntry: (entryId: string) => void;
    onMarkDone: (entryId: string) => void;
    isEditable?: boolean;
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export function DayColumn({ day, entries, recipes, onAddEntry, onRemoveEntry, onMarkDone, isEditable = true }: DayColumnProps) {


    return (
        <div className={cn("flex flex-col gap-4 min-w-[200px] p-2 w-full")}>

            <div className="w-full flex flex-col sm:flex-row justify-between gap-4">
                {MEAL_TYPES.map((type) => {
                    const mealEntries = entries.filter((e) => e.mealType === type);
                    return (
                        <Card key={type} className="border-dashed rounded-lg py-2 sm:w-88 min-h-[250px] max-h-[250px] ">
                            <CardHeader className="p-2 px-6 pb-0">
                                <div className="flex justify-between items-center ">
                                    <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                                        {type}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col align-center justify-evenly">
                                {mealEntries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={cn("bg-card border rounded-md p-2 text-sm flex justify-between items-start group", entry.done ? "bg-primary/20" : "")}
                                    >
                                        <span className="font-medium line-clamp-2">
                                            {entry.recipeName || 'Unknown Recipe'}
                                        </span>
                                        {entry.done ? (
                                            <div>
                                                <span className='font-bold'>DONE</span><CheckSquareIcon className="h-4 w-4 text-primary inline mx-1" />
                                            </div>
                                        ) : (
                                            isEditable && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                                                        onClick={() => onMarkDone(entry.id)}
                                                        title="Mark as consumed"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                                        onClick={() => onRemoveEntry(entry.id)}
                                                        title="Delete entry"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ))}
                                {mealEntries.length === 0 && isEditable && (
                                    <RecipeSelector
                                        recipes={recipes}
                                        onSelect={(recipe) => onAddEntry(recipe.id, type)}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
