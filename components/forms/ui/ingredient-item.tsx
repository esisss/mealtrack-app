import { PantryItemSelect } from "@/types";
import { Trash } from "lucide-react";

interface IngredientItemProps {
    pantryItemId: string;
    name: string,
    ingredient: PantryItemSelect;
    qty: string;
    baseUnit: string;
    index: number;
    onQuantityChange: (id: string, qty: string) => void;
    onRemove: (id: string) => void;
}

export const IngredientItem = ({ ingredient, qty, baseUnit, name, index, onQuantityChange, onRemove, pantryItemId }: IngredientItemProps) => (
    <div className="flex items-center justify-between p-2 border rounded">
        <input readOnly className='field-sizing-content outline-none pointer-events-none' type="text" name={`ingredients[${index}][name]`} value={name} />
        <div className="flex items-center gap-2">
            <input type="hidden" name={`ingredients[${index}][pantryItemId]`} value={pantryItemId} />
            <input
                name={`ingredients[${index}][qty]`}
                type="number"
                min={0}
                placeholder="Qty"
                value={qty}
                onChange={(e) => onQuantityChange(ingredient.id, e.target.value)}
                className="w-20 px-2 py-1 text-sm border rounded"
            />
            <input readOnly className='field-sizing-content outline-none pointer-events-none ' type="text" name={`ingredients[${index}][baseUnit]`} value={baseUnit} />
            <button
                type="button"
                onClick={() => onRemove(ingredient.id)}
                className="text-red-500 hover:text-red-700"
            >
                <Trash size={16} className='text-destructive' />
            </button>
        </div>
    </div>
);