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

export const CLOUDINARY_WIDGET_STYLES = {
  palette: {
    window: "rgba(17, 24, 39, 0.92)",
    windowBorder: "rgba(148, 163, 184, 0.25)",
    tabIcon: "#34D399",
    inactiveTabIcon: "rgba(148, 163, 184, 0.75)",
    menuIcons: "rgba(226, 232, 240, 0.75)",
    textLight: "#F8FAFC",
    textDark: "#0F172A",
    action: "#34D399",
    error: "#FB7185",
    inProgress: "#60A5FA",
    complete: "#34D399",
    sourceBg: "rgba(15, 23, 42, 0.55)",
  },
  fonts: {
    default: null,
    "'Inter', sans-serif": {
      url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
      active: true,
    },
  },
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
  const [instructions, setInstructions] = useState<string[]>(initialRecipe?.instructions || []);
  const [tags, setTags] = useState<string[]>(initialRecipe?.tags || []);
  const [actionState, performAction, isPending] = useActionState<
    RecipeActionResponse,
    FormData
  >((state: RecipeActionResponse, formData: FormData) => {
    if (mode === 'edit' && initialRecipe) {
      return updateRecipeAction(initialRecipe.id, formData);
    }

    console.log(formData.get('fixedBuyQty'));
    return validateAndSendRecipe(formData);
  }, INITIAL_STATE);

  // Initialize form with existing recipe data in edit mode
  useEffect(() => {
    if (mode === 'edit' && recipeIngredients && pantryItems) {
      const initialIngredients = recipeIngredients.map((ri) => ({
        id: ri.pantryItemId,
        qty: ri.qtyPerServing,
      }));
      // stinky code smell but not sure how to workaround efficiently, and it works
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const handleAddNewIngredient = (ingredient: { name: string; baseUnit: PantryItemSelect['baseUnit'], fixedBuyQty?: string }) => {
    if (!ingredient.name || availableIngredients.find(ing => ing.name.toLowerCase() === ingredient.name.toLowerCase())) {
      toast.error('Ingredient name cannot be empty or already exists.');
      return;
    }
    const newId =
      availableIngredients.length > 0
        ? (Math.max(...availableIngredients.map((i, index) => index)) + 1).toString()
        : '0';

    const newIngredientObject: PantryItemSelect = {
      id: newId,
      name: ingredient.name,
      userId: '',
      baseUnit: ingredient.baseUnit,
      fixedBuyQty: ingredient.fixedBuyQty ? ingredient.fixedBuyQty : null,
      unitToGrams: null,
      unitToMl: null,
      kcalPerBaseUnit: null,
      proteinPerBaseUnit: null,
      carbsPerBaseUnit: null,
      fatPerBaseUnit: null,
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
  const handleAddInstruction = () => setInstructions([...instructions, '']);
  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };
  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleAddTag = () => setTags([...tags, '']);
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };
  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <form action={performAction} className="flex flex-col h-full max-h-[85vh]">
      <div className="flex-1 overflow-y-auto p-1 pr-4 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Basic Info & Image */}
          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                General Information
              </h3>

              <div>
                <label htmlFor="recipeName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Recipe Name
                </label>
                <input
                  name="recipeName"
                  type="text"
                  id="recipeName"
                  defaultValue={initialRecipe?.name || ''}
                  placeholder="e.g., Homemade Pasta Carbonara"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
                  required
                />
                {actionState.errors?.recipeName && (
                  <p className="mt-1.5 text-xs font-medium text-destructive">
                    {actionState.errors.recipeName.join(', ')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description / Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  defaultValue={initialRecipe?.notes || ''}
                  placeholder="Tell us about this recipe..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
                  rows={4}
                  required
                />
                {actionState.errors?.notes && (
                  <p className="mt-1.5 text-xs font-medium text-destructive">
                    {actionState.errors.notes.join(', ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="prepTime" className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    Prep (min)
                  </label>
                  <input
                    name="prepTime"
                    type="number"
                    id="prepTime"
                    defaultValue={initialRecipe?.prepTime || ''}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="cookTime" className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    Cook (min)
                  </label>
                  <input
                    name="cookTime"
                    type="number"
                    id="cookTime"
                    defaultValue={initialRecipe?.cookTime || ''}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="servings" className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    Servings
                  </label>
                  <input
                    name="servings"
                    type="number"
                    id="servings"
                    defaultValue={initialRecipe?.servings || '1'}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                Visuals & Tags
              </h3>

              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center transition-all">
                {imageUpload ? (
                  <>
                    <input readOnly type="text" name="public_id" value={imageUpload.public_id} className="hidden" />
                    <input readOnly type="text" name="secure_url" value={imageUpload.secure_url} className="hidden" />
                    <Image src={imageUpload.secure_url} alt="Recipe" fill className="object-cover" />
                    <CldUploadWidget
                      options={{
                        maxFiles: 1,
                        uploadPreset: 'mealwisepreset',
                        styles: CLOUDINARY_WIDGET_STYLES
                      }}
                      onSuccess={handleImageUpload}
                    >
                      {({ open }) => (
                        <button
                          onClick={(e) => { e.preventDefault(); open() }}
                          className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-black/80 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <ImageIcon className="h-4 w-4 text-emerald-600" />
                        </button>
                      )}
                    </CldUploadWidget>
                  </>
                ) : (
                  <CldUploadWidget
                    options={{
                      maxFiles: 1,
                      uploadPreset: 'mealwisepreset',
                      styles: CLOUDINARY_WIDGET_STYLES
                    }}
                    onSuccess={handleImageUpload}
                    onUploadAdded={() => setImageUploading(true)}
                  >
                    {({ open }) => (
                      <Button onClick={(e) => { e.preventDefault(); open() }} variant="ghost" className="cursor-pointer flex flex-col gap-2 h-auto py-8 dark:hover:bg-transparent hover:bg-transparent hover:text-emerald-600 dark:hover:text-emerald-400 text-gray-400">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Upload Image</span>
                      </Button>
                    )}
                  </CldUploadWidget>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                  Post-tags (e.g., Vegan, Spicy)
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex gap-1 items-center bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                      <input
                        name={`tags[${index}]`}
                        type="text"
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs font-bold w-16"
                      />
                      <button type="button" onClick={() => handleRemoveTag(index)} className="hover:text-red-500 transition-colors">
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTag} className="rounded-lg h-7 text-xs border-dashed">
                    + Add Tag
                  </Button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Ingredients & Instructions */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                Ingredients
              </h3>

              <div className="space-y-3">
                <SearchBarSelect
                  items={availableIngredients.map(ing => ({ value: ing.id.toString(), label: ing.name }))}
                  selected=""
                  onSelect={(value) => handleIngredientToggle(String(value))}
                  placeholder="Find ingredients..."
                />

                <div className="bg-white dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                  <div className="max-h-[250px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {selectedIngredients.map((selection, index) => {
                      const ingredient = availableIngredients.find(ing => ing.id === selection.id);
                      if (!ingredient) return null;
                      return (
                        <IngredientItem
                          key={ingredient.id}
                          pantryItemId={ingredient.id}
                          baseUnit={ingredient.baseUnit}
                          name={ingredient.name}
                          ingredient={ingredient}
                          fixedBuyQty={ingredient.fixedBuyQty?.toString()}
                          qty={selection.qty}
                          index={index}
                          onQuantityChange={handleQuantityChange}
                          onRemove={handleIngredientToggle}
                        />
                      );
                    })}
                    {selectedIngredients.length === 0 && (
                      <div className="py-8 text-center">
                        <p className="text-sm text-gray-400 italic">No ingredients added yet.</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                    <AddNewIngredient onAdd={handleAddNewIngredient} />
                  </div>
                </div>
                {actionState.errors?.ingredients && (
                  <p className="text-xs font-medium text-destructive">{actionState.errors.ingredients.join(', ')}</p>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                Preparation Steps
              </h3>

              <div className="space-y-3">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {instructions.map((step, index) => (
                    <div key={index} className="flex gap-3 group bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-full text-xs font-black">
                        {index + 1}
                      </div>
                      <textarea
                        name={`instructions[${index}]`}
                        value={step}
                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                        placeholder={`Describe step ${index + 1}...`}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none py-0"
                        rows={2}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveInstruction(index)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleAddInstruction} className="w-full border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl h-10 text-gray-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all">
                  + Add Next Step
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <p className="text-xs text-gray-400 italic">
          Tip: You can add calories and macros in the Ingredient Section.
        </p>
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isPending || imageUploading}
            className="rounded-xl px-8 h-12 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all gap-2"
          >
            {isPending ? (
              <>
                <LoaderCircleIcon className="animate-spin h-5 w-5" />
                {mode === 'edit' ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              mode === 'edit' ? 'Update Recipe' : 'Ready to Save!'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
