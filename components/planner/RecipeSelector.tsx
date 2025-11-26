'use client';

import { RecipeSelect } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface RecipeSelectorProps {
    recipes: RecipeSelect[];
    onSelect: (recipe: RecipeSelect) => void;
}

export function RecipeSelector({ recipes, onSelect }: RecipeSelectorProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (recipe: RecipeSelect) => {
        onSelect(recipe);
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Recipe
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Select a Recipe</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-2">
                    {recipes.map((recipe) => (
                        <Button
                            key={recipe.id}
                            variant="ghost"
                            className="justify-start text-left h-auto py-3"
                            onClick={() => handleSelect(recipe)}
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">{recipe.name}</span>
                                {recipe.notes && (
                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                        {recipe.notes}
                                    </span>
                                )}
                            </div>
                        </Button>
                    ))}
                    {recipes.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No recipes found. Create some recipes first!
                        </p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
