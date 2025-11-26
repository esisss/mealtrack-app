import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PantryItemSelect } from "@/types";

const AVAILABLE_UNITS: PantryItemSelect['baseUnit'][] = ['g', 'ml', 'unit', 'cups', 'tbsp', 'tsp'];

interface AddNewIngredientProps {
    onAdd?: (ingredient: { name: string; baseUnit: PantryItemSelect['baseUnit'] }) => void;
}

export const AddNewIngredient = ({ onAdd }: AddNewIngredientProps) => {
    const [newIngredient, setNewIngredient] = useState("");
    const [newBaseUnit, setNewBaseUnit] = useState<PantryItemSelect['baseUnit']>('g');

    const handleAdd = () => {
        if (newIngredient.trim() === "") return;
        onAdd?.({ name: newIngredient.trim(), baseUnit: newBaseUnit });
        setNewIngredient("");
        setNewBaseUnit('g');
    };

    return (
        <div>
            <label
                htmlFor="newIngredient"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                Add New Ingredient
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <input
                    type="text"
                    id="newIngredient"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                />
                <select
                    value={newBaseUnit}
                    onChange={(e) => setNewBaseUnit(e.target.value as PantryItemSelect['baseUnit'])}
                    className="px-3 py-2 border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-sm"
                >
                    {AVAILABLE_UNITS.map((unit, index) => (
                        <option key={index} value={unit}>{unit}</option>
                    ))}
                </select>
                <Button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                    Add
                </Button>
            </div>
        </div>
    );
};