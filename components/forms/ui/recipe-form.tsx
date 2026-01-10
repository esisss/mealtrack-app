'use client';

import { useActionState, useState, useEffect } from 'react';
import {
  RecipeActionResponse,
  validateAndSendRecipe,
  updateRecipeAction,
} from '../../../app/actions/recipe-form-action';
import { ImageIcon, LoaderCircleIcon, Trash } from 'lucide-react';
import { SearchBarSelect } from '@/components/ui/searchbarselect';
import { toast } from 'react-hot-toast';
import { IngredientItem } from './ingredient-item';
import { PantryItemSelect, RecipeSelect } from '@/types';
import { AddNewIngredient } from './addNewIngredientInput';
import { Button } from '@/components/ui/button';
import { CldUploadWidget } from "next-cloudinary";
import Image from 'next/image';

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
  initialRecipe?: RecipeSelect;
  recipeIngredients?: Array<{
    pantryItemId: string;
    qtyPerServing: string;
  }>;
  mode?: 'create' | 'edit';
}

export const RecipeForm = ({
  onSuccess,
  pantryItems,
  initialRecipe,
  recipeIngredients,
  mode = 'create'
}: RecipeFormProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [imageUpload, setImageUpload] = useState<{ secure_url: string, public_id: string } | null>(
    initialRecipe?.imageUrl && initialRecipe?.publicImageId
      ? { secure_url: initialRecipe.imageUrl, public_id: initialRecipe.publicImageId }
      : null
  );
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [availableIngredients, setAvailableIngredients] = useState<PantryItemSelect[]>(pantryItems || []);
  const [actionState, performAction, isPending] = useActionState<
    RecipeActionResponse,
    FormData
  >((state: RecipeActionResponse, formData: FormData) => {
    if (mode === 'edit' && initialRecipe) {
      return updateRecipeAction(initialRecipe.id, formData);
    }
    return validateAndSendRecipe(formData);
  }, INITIAL_STATE);

  // Initialize form with existing recipe data in edit mode
  useEffect(() => {
    if (mode === 'edit' && recipeIngredients && pantryItems) {
      const initialIngredients = recipeIngredients.map((ri) => ({
        id: ri.pantryItemId,
        qty: ri.qtyPerServing,
      }));
      setSelectedIngredients(initialIngredients);
    }
  }, [mode, recipeIngredients, pantryItems]);

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

  // Handler for AddNewIngredient component
  const handleAddNewIngredient = (ingredient: { name: string; baseUnit: PantryItemSelect['baseUnit'] }) => {
    if (!ingredient.name || availableIngredients.find(ing => ing.name.toLowerCase() === ingredient.name.toLowerCase())) {
      toast.error('Ingredient name cannot be empty or already exists.');
      return;
    }
    const newId =
      availableIngredients.length > 0
        ? (Math.max(...availableIngredients.map((i, index) => index)) + 1).toString()
        : '1';

    const newIngredientObject: PantryItemSelect = {
      id: newId,
      name: ingredient.name,
      userId: '',
      baseUnit: ingredient.baseUnit,
      unitToGrams: null,
      unitToMl: null,
      kcalPerBaseUnit: null,
      defaultPkgQty: null,
      defaultPkgPrice: null,
      tags: null,
      createdAt: new Date(),
      updatedAt: null,
    };
    setAvailableIngredients((prev) => [...prev, newIngredientObject]);
  };
  const handleImageUpload = (result: any) => {
    setImageUploading(false);
    setImageUpload({
      secure_url: result.info.secure_url,
      public_id: result.info.public_id
    });

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
        <input
          name="recipeName"
          type="text"
          id="recipeName"
          defaultValue={initialRecipe?.name || ''}
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
        <textarea
          name="notes"
          id="notes"
          defaultValue={initialRecipe?.notes || ''}
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
      {
        imageUpload ? (
          <div className="mt-2">
            <input readOnly type="text" name="public_id" value={imageUpload.public_id} className='hidden' />
            <input readOnly type="text" name="secure_url" value={imageUpload.secure_url} className='hidden' />
            <Image src={imageUpload.secure_url} alt="Recipe" width={500} height={500} className="w-full h-40 object-cover rounded-lg" />
          </div>
        ) :
          <CldUploadWidget options={{
            maxFiles: 1,
            maxFileSize: 5 * 1024 * 1024, // 5 MB
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          }}
            uploadPreset='mealwisepreset'
            onUploadAdded={() => setImageUploading(true)}
            onSuccess={handleImageUpload} >
            {({ open }) => <Button onClick={(e) => { e.preventDefault(); open() }}> <ImageIcon className="mr-2 h-4 w-4" /> Upload Recipe Image</Button>}
          </CldUploadWidget>
      }
      <AddNewIngredient onAdd={handleAddNewIngredient} />

      < div className="flex justify-end" >
        <Button
          className={
            `inline-flex items-center px-3 rounded-md border border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 ${isPending && 'opacity-50 cursor-not-allowed'
            }`
          }
          type="submit"
          disabled={isPending || imageUploading}
        >
          {isPending ? (mode === 'edit' ? 'Updating Recipe' : 'Saving Recipe') : (mode === 'edit' ? 'Update Recipe' : 'Save Recipe')}{' '}
          {isPending && <LoaderCircleIcon className="animate-spin h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
};
