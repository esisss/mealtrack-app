'use client';

import { useActionState, useState, useEffect } from 'react';
import {
  RecipeActionResponse,
  validateAndSendRecipe,
} from '../actions/recipe-form-action';
import { LoaderCircleIcon, Trash } from 'lucide-react';
import { SearchBarSelect } from '@/components/ui/searchbarselect';
import { toast } from 'react-hot-toast';
import { IngredientItem } from './ingredient-item';
import { PantryItemSelect } from '@/types';
import { AddNewIngredient } from './addNewIngredientInput';
import { Button } from '@/components/ui/button';

interface SelectedIngredient {
  id: string;
  qty: string;
}
// Constants
const INITIAL_STATE: RecipeActionResponse = {
  success: false,
  message: '',
  errors: {},
};

interface RecipeFormProps {
  onSuccess?: () => void;
  pantryItems?: PantryItemSelect[];
}

export const RecipeForm = ({ onSuccess, pantryItems }: RecipeFormProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [availableIngredients, setAvailableIngredients] =
    useState<PantryItemSelect[]>(pantryItems || []);
  const [newBaseUnit, setNewBaseUnit] = useState<PantryItemSelect['baseUnit']>('g');
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

  const handleIngredientToggle = (ingredientId: string) => {

    setSelectedIngredients((prev) => {
      const isSelected = prev.some((ing) => ing.id === ingredientId);
      if (isSelected) {
        return prev.filter((ing) => ing.id !== ingredientId);
      } else {
        return [...prev, { id: ingredientId, qty: '' }];
      }
    });
  };

  const handleQuantityChange = (ingredientId: string, qty: string) => {
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
          ? (Math.max(...availableIngredients.map((i) => parseInt(i.id))) + 1).toString()
          : '1';
      const newIngredientObject: PantryItemSelect = {
        id: newId,
        name: newIngredient.trim(),
        userId: '',
        baseUnit: newBaseUnit,
        unitToGrams: null,
        unitToMl: null,
        kcalPerBaseUnit: null,
        defaultPkgQty: null,
        defaultPkgPrice: null,
        tags: null,
        createdAt: new Date(),
        updatedAt: null,
      }; // Defaulting new ingredients to 'unit'
      setAvailableIngredients((prev) => [...prev, newIngredientObject]);
      setNewIngredient('');
    } else {
      toast.error('Ingredient name cannot be empty or already exists.');
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
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Recipe Notes
        </label>
        < textarea
          name="notes"
          id="notes"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          rows={3}
          required
        />
      </div>
      {actionState.errors?.notes && (
        <div className="mt-2 text-sm text-destructive">
          {actionState.errors.notes.join(', ')}
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
              const ingredientId = String(value);
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
                  (ing: PantryItemSelect) => ing.id === selection.id
                );
                if (!ingredient) return null;
                return (
                  <IngredientItem
                    pantryItemId={ingredient.id ?? ''}
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
        onAdd={() => { handleAddNewIngredient() }}
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
