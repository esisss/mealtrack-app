"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Ingredient {
  id: number;
  name: string;
  baseUnit: 'g' | 'ml' | 'unit';
}

interface SelectedIngredient {
  id: number;
  qty: string;
}

const mockIngredients: Ingredient[] = [
  { id: 1, name: 'Flour', baseUnit: 'g' },
  { id: 2, name: 'Sugar', baseUnit: 'g' },
  { id: 3, name: 'Eggs', baseUnit: 'unit' },
  { id: 4, name: 'Milk', baseUnit: 'ml' },
  { id: 5, name: 'Tomatoes', baseUnit: 'g' },
  { id: 6, name: 'Cheese', baseUnit: 'g' },
];

export const RecipeForm = () => {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>(mockIngredients);

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
      newIngredient.trim() !== "" &&
      !availableIngredients.find(
        (ing) => ing.name.toLowerCase() === newIngredient.trim().toLowerCase()
      )
    ) {
      const newId =
        availableIngredients.length > 0
          ? Math.max(...availableIngredients.map((i) => i.id)) + 1
          : 1;
      const newIngredientObject: Ingredient = { id: newId, name: newIngredient.trim(), baseUnit: 'unit' }; // Defaulting new ingredients to 'unit'
      setAvailableIngredients((prev) => [...prev, newIngredientObject]);
      handleIngredientToggle(newId);
      setNewIngredient('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Recipe:", {
      name: recipeName,
      description,
      ingredients: selectedIngredients,
    });
    // Here you would typically handle the form submission, e.g., by calling an API.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="recipeName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Recipe Name
        </label>
        <input
          type="text"
          id="recipeName"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ingredients
        </label>
        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md">
          {availableIngredients.map((ingredient) => {
            const selection = selectedIngredients.find(si => si.id === ingredient.id);
            return (
              <div key={ingredient.id}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`ingredient-${ingredient.id}`}
                    checked={!!selection}
                    onChange={() => handleIngredientToggle(ingredient.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`ingredient-${ingredient.id}`} className="ml-3 block text-sm text-gray-900 dark:text-gray-100">
                    {ingredient.name}
                  </label>
                </div>
                {selection && (
                  <div className="flex items-center mt-1 ml-7">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={selection.qty}
                      onChange={(e) => handleQuantityChange(ingredient.id, e.target.value)}
                      className="w-20 px-2 py-1 text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{ingredient.baseUnit}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
          <Button
            type="button"
            onClick={handleAddNewIngredient}
            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Recipe</Button>
      </div>
    </form>
  );
};
