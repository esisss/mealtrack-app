'use client';

import { MealPlanEntrySelect, RecipeSelect } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { RecipeSelector } from './RecipeSelector';
import { cn } from '@/lib/utils';

interface DayColumnProps {
    day: Date;
    entries: (MealPlanEntrySelect & { recipeName: string | null })[];
    recipes: RecipeSelect[];
    onAddEntry: (recipeId: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
    onRemoveEntry: (entryId: string) => void;
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export function DayColumn({ day, entries, recipes, onAddEntry, onRemoveEntry }: DayColumnProps) {
    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNum = day.getDate();
    const isToday = new Date().toDateString() === day.toDateString();

    return (
        <div className={cn("flex flex-col gap-4 min-w-[200px]", isToday && "bg-accent/10 rounded-lg p-2")}>
            <div className="text-center">
                <div className="font-bold uppercase text-sm text-muted-foreground">{dayName}</div>
                <div className={cn("text-2xl font-bold", isToday && "text-primary")}>{dateNum}</div>
            </div>

            <div className="flex flex-col gap-4">
                {MEAL_TYPES.map((type) => {
                    const mealEntries = entries.filter((e) => e.mealType === type);
                    return (
                        <Card key={type} className="border-dashed">
                            <CardHeader className="p-3 pb-0">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                                        {type}
                                    </CardTitle>
                                    <RecipeSelector
                                        recipes={recipes}
                                        onSelect={(recipe) => onAddEntry(recipe.id, type)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-2 flex flex-col gap-2">
                                {mealEntries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="bg-card border rounded-md p-2 text-sm flex justify-between items-start group"
                                    >
                                        <span className="font-medium line-clamp-2">
                                            {entry.recipeName || 'Unknown Recipe'}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                            onClick={() => onRemoveEntry(entry.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                {mealEntries.length === 0 && (
                                    <div className="h-8" />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
