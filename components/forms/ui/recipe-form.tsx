'use client';

import { useActionState, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  RecipeActionResponse,
  validateAndSendRecipe,
} from '../actions/recipe-form-action';
import { LoaderCircleIcon, Trash } from 'lucide-react';
import { SearchBarSelect } from '@/components/ui/searchbarselect';
import { toast } from 'react-hot-toast';

// Types
type BaseUnit = 'g' | 'ml' | 'unit' | 'cups' | 'tbsp' | 'tsp';

interface RecipeIngredient {
  id: number;
  name: string;
  baseUnit: BaseUnit;
}

interface SelectedIngredient {
  id: number;
  qty: string;
}

// Constants
const INITIAL_STATE: RecipeActionResponse = {
  success: false,
  message: '',
  errors: {},
};

const AVAILABLE_UNITS: BaseUnit[] = ['g', 'ml', 'unit', 'cups', 'tbsp', 'tsp'];

const MOCK_INGREDIENTS: RecipeIngredient[] = [
  { id: 1, name: 'Flour', baseUnit: 'g' },
  { id: 2, name: 'Sugar', baseUnit: 'g' },
  { id: 3, name: 'Eggs', baseUnit: 'unit' },
  { id: 4, name: 'Milk', baseUnit: 'ml' },
  { id: 5, name: 'Tomatoes', baseUnit: 'g' },
  { id: 6, name: 'Cheese', baseUnit: 'g' },
];

// Components
interface AddNewIngredientProps {
  newIngredient: string;
  setNewIngredient: (value: string) => void;
  newBaseUnit: BaseUnit;
  setNewBaseUnit: (value: BaseUnit) => void;
  onAdd: () => void;
}

const AddNewIngredient = ({
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
        onChange={(e) => setNewBaseUnit(e.target.value as BaseUnit)}
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

interface IngredientItemProps {
  name: string,
  ingredient: RecipeIngredient;
  qty: string;
  baseUnit: string;
  index: number;
  onQuantityChange: (id: number, qty: string) => void;
  onRemove: (id: number) => void;
}

const IngredientItem = ({ ingredient, qty, baseUnit, name, index, onQuantityChange, onRemove }: IngredientItemProps) => (
  <div className="flex items-center justify-between p-2 border rounded">
    <input readOnly className='field-sizing-content outline-none pointer-events-none' type="text" name={`ingredients[${index}][name]`} value={name} />
    <div className="flex items-center gap-2">
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

// Main Component
interface RecipeFormProps {
  onSuccess?: () => void;
}

export const RecipeForm = ({ onSuccess }: RecipeFormProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [availableIngredients, setAvailableIngredients] =
    useState<RecipeIngredient[]>(MOCK_INGREDIENTS);
  const [newBaseUnit, setNewBaseUnit] = useState<BaseUnit>('g');
  const [actionState, performAction, isPending] = useActionState<
    RecipeActionResponse,
    FormData
  >((state: RecipeActionResponse, formData: FormData) => {
    return validateAndSendRecipe(formData);
  }, INITIAL_STATE);

  // Notify parent (modal) when action succeeds
  useEffect(() => {
    if (actionState?.success) {
      toast.success('Recipe saved successfully!');
      onSuccess?.();
    }
  }, [actionState?.success, onSuccess]);

  const handleIngredientToggle = (ingredientId: number) => {
    setSelectedIngredients((prev) => {
      const isSelected = prev.some((ing) => ing.id === ingredientId);
      if (isSelected) {
        return prev.filter((ing) => ing.id !== ingredientId);
      } else {
        return [...prev, { id: ingredientId, qty: '' }];
      }
    });
  };

  const handleQuantityChange = (ingredientId: number, qty: string) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) => (ing.id === ingredientId ? { ...ing, qty } : ing))
    );
  };

  const handleAddNewIngredient = () => {
    if (
      newIngredient.trim() !== '' &&
      !availableIngredients.find(
        (ing) => ing.name.toLowerCase() === newIngredient.trim().toLowerCase()
      )
    ) {
      const newId =
        availableIngredients.length > 0
          ? Math.max(...availableIngredients.map((i) => i.id)) + 1
          : 1;
      const newIngredientObject: RecipeIngredient = {
        id: newId,
        name: newIngredient.trim(),
        baseUnit: newBaseUnit,
      }; // Defaulting new ingredients to 'unit'
      setAvailableIngredients((prev) => [...prev, newIngredientObject]);
      handleIngredientToggle(newId);
      setNewIngredient('');
    }
  };

  return (
    <form action={performAction} className="space-y-4" >
      <div>
        <label
          htmlFor="recipeName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Recipe Name
        </label>
        < input
          name="recipeName"
          type="text"
          id="recipeName"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      {actionState.errors?.recipeName && (
        <div className="mt-2 text-sm text-destructive">
          {actionState.errors.recipeName.join(', ')}
        </div>
      )}
      < div >
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        < textarea
          name="description"
          id="description"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          rows={3}
          required
        />
      </div>
      {actionState.errors?.description && (
        <div className="mt-2 text-sm text-destructive">
          {actionState.errors.description.join(', ')}
        </div>
      )}
      < div >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" >
          Ingredients
        </label>

        <div className="mt-2 mb-2">
          <SearchBarSelect
            items={availableIngredients.map(ing => ({
              value: ing.id.toString(),
              label: ing.name
            }))}
            selected=""
            onSelect={(value) => {
              const ingredientId = parseInt(value);
              handleIngredientToggle(ingredientId);
            }}
            placeholder="Search ingredients..."
          />
        </div>

        < div className="mt-2 space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md" >
          <div className="flex flex-col gap-2" >
            {
              selectedIngredients.map((selection, index) => {
                const ingredient = availableIngredients.find(
                  (ing: RecipeIngredient) => ing.id === selection.id
                );
                if (!ingredient) return null;
                return (
                  <IngredientItem
                    baseUnit={ingredient.baseUnit}
                    name={ingredient.name}
                    key={ingredient.id}
                    ingredient={ingredient}
                    qty={selection.qty}
                    index={index}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleIngredientToggle}
                  />
                );
              })}
          </div>
          {selectedIngredients.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No ingredients selected.</p>
          )}
          {actionState.errors?.ingredients && (
            <div className="mt-2 text-sm text-destructive">
              {actionState.errors.ingredients.join(', ')}
            </div>
          )}
        </div>
      </div>

      <AddNewIngredient
        newIngredient={newIngredient}
        setNewIngredient={setNewIngredient}
        newBaseUnit={newBaseUnit}
        setNewBaseUnit={setNewBaseUnit}
        onAdd={handleAddNewIngredient}
      />

      < div className="flex justify-end" >
        <Button
          className={
            `inline-flex items-center px-3 rounded-md border border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 ${isPending && 'opacity-50 cursor-not-allowed'
            }`
          }
          type="submit"
          disabled={isPending}
        >
          {isPending ? `Saving Recipe` : `Save Recipe`}{' '}
          {isPending && <LoaderCircleIcon className="animate-spin h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
};
