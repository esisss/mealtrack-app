import { Button } from "@/components/ui/button";
import { PantryItemSelect } from "@/types";

interface AddNewIngredientProps {
    newIngredient: string;
    setNewIngredient: (value: string) => void;
    newBaseUnit: PantryItemSelect['baseUnit'];
    setNewBaseUnit: (value: PantryItemSelect['baseUnit']) => void;
    onAdd: () => void;
}

const AVAILABLE_UNITS: PantryItemSelect['baseUnit'][] = ['g', 'ml', 'unit', 'cups', 'tbsp', 'tsp'];
export const AddNewIngredient = ({
    newIngredient,
    setNewIngredient,
    newBaseUnit,
    setNewBaseUnit,
    onAdd
}: AddNewIngredientProps) => (
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
                {AVAILABLE_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                ))}
            </select>
            <Button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
                Add
            </Button>
        </div>
    </div>
);