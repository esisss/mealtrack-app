import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PantryItemSelect } from "@/types";
import { Label } from "@radix-ui/react-label";

const AVAILABLE_UNITS: PantryItemSelect['baseUnit'][] = ['g', 'ml', 'unit', 'cups', 'tbsp', 'tsp'];

interface AddNewIngredientProps {
    onAdd?: (ingredient: { name: string; baseUnit: PantryItemSelect['baseUnit']; fixedBuyQty?: string }) => void;
}

export const AddNewIngredient = ({ onAdd }: AddNewIngredientProps) => {
    const [newIngredient, setNewIngredient] = useState("");
    const [hasMinimumBuyQty, setHasMinimumBuyQty] = useState(false);
    const [newMinimumQty, setNewMinimumQty] = useState<string | number>(100);
    const [newBaseUnit, setNewBaseUnit] = useState<PantryItemSelect['baseUnit']>('g');

    const handleAdd = () => {
        if (newIngredient.trim() === "") return;
        if (hasMinimumBuyQty) {
            setHasMinimumBuyQty(false);
            setNewMinimumQty(100);
            onAdd?.({ name: newIngredient.trim(), baseUnit: newBaseUnit, fixedBuyQty: newMinimumQty.toString() });
        } else {
            onAdd?.({ name: newIngredient.trim(), baseUnit: newBaseUnit });
        }
        setNewIngredient("");
        setNewBaseUnit('g');
    };

    return (
        <div className="flex flex-col">
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
            <div className="flex flex-col items-start my-1 w-fit">
                {hasMinimumBuyQty && (
                    <div className="mt-1 flex flex-col rounded-md shadow-sm">
                        <Label className="text-sm " htmlFor="minimumBuyQty">Set fixed buy quantity</Label>
                        <input
                            type="number"
                            name="minimumBuyQty"
                            id="minimumBuyQty"
                            min={100}
                            value={newMinimumQty}
                            onChange={(e) => setNewMinimumQty(Number(e.target.value))}
                            className="flex-1 my-1 min-w-0 max-w-[150px] w-full px-3 py-2 rounded-md focus:ring-primary focus:border-primary sm:text-sm border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                        />

                    </div>
                )}
                <div className="flex items-center my-1">
                    <input className="mr-2 h-4 w-4 " type="checkbox" name="hasMinimumBuyQty" id="hasMinimumBuyQty" checked={hasMinimumBuyQty} onChange={() => setHasMinimumBuyQty(!hasMinimumBuyQty)} />
                    <Label className="text-sm " htmlFor="hasMinimumBuyQty">Has fixed buy quantity</Label>
                </div>
            </div>
        </div>
    );
};