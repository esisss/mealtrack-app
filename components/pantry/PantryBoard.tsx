"use client"

import { PantryItemInsert, PantryItemSelect } from "@/types"
import { startTransition, useOptimistic, } from "react"
import { AddNewIngredient } from "../forms/ui/addNewIngredientInput"
import { addNewPantryItemsAction } from "@/app/actions/pantryactions"

export const PantryBoard = ({ pantryItems }: { pantryItems: PantryItemSelect[] }) => {

    const [optimisticPantryItems, addOptimisticPantryItem] = useOptimistic(pantryItems, (state, newItem: PantryItemSelect) => {
        // Add the new item and sort by name to match the database order
        return [...state, newItem].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Wrap the optimistic updater so it accepts the smaller shape emitted by AddNewIngredient
    const handleAdd = async (ingredient: { name: string; baseUnit: PantryItemInsert['baseUnit'] }) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticItem = {
            id: tempId,
            name: ingredient.name,
            baseUnit: ingredient.baseUnit,
            unitToGrams: null,
            unitToMl: null,
            kcalPerBaseUnit: null,
            createdAt: new Date(),
            updatedAt: null
        } as PantryItemSelect;

        const itemForServer = {
            name: ingredient.name,
            baseUnit: ingredient.baseUnit,
            unitToGrams: null,
            unitToMl: null,
            kcalPerBaseUnit: null,
            createdAt: new Date(),
            updatedAt: null
        } as PantryItemInsert;

        startTransition(async () => {
            addOptimisticPantryItem(optimisticItem);
        });

        // Add the item to the database and get the actual item back
        const result = await addNewPantryItemsAction([itemForServer]);

        // If successful, the server response will trigger a revalidation
        // and the optimistic item will be replaced with the real one
        if (!result.success) {
            console.error('Failed to add pantry item:', result.message);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Your Pantry Items</h1>
                <AddNewIngredient onAdd={handleAdd} />
            </div>
            {optimisticPantryItems && optimisticPantryItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {optimisticPantryItems.map((item) => (
                        <div key={item.id || item.name} className="border p-4 rounded-lg">
                            <h2 className="font-bold">{item.name}</h2>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="mb-4">You haven&apos;t added any pantry items yet.</p>
                </div>
            )}
        </div>
    )
}
