"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { RecipeForm } from "@/components/forms/recipe-form";

// Simulate the shape of a recipe
interface Recipe {
  id: number;
  name: string;
  description: string;
}

// Mock data access layer
const fetchRecipes = async (userHasRecipes: boolean): Promise<Recipe[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (userHasRecipes) {
        resolve([
          {
            id: 1,
            name: "Spaghetti Carbonara",
            description: "A classic Italian pasta dish.",
          },
          {
            id: 2,
            name: "Chicken Tikka Masala",
            description: "Creamy and flavorful curry.",
          },
        ]);
      } else {
        resolve([]);
      }
    }, 1000);
  });
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userHasRecipes, setUserHasRecipes] = useState(true); // Toggle this to simulate empty state

  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      const fetchedRecipes = await fetchRecipes(userHasRecipes);
      setRecipes(fetchedRecipes);
      setIsLoading(false);
    };

    loadRecipes();
  }, [userHasRecipes]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Recipes</h1>
        <Button onClick={openModal}>Add New Recipe</Button>
      </div>

      {/* Toggle button to simulate different states */}
      <div className="mb-4">
        <Button onClick={() => setUserHasRecipes(!userHasRecipes)}>
          {userHasRecipes ? "Simulate Empty List" : "Simulate Has Recipes"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="border p-4 rounded-lg">
              <h2 className="font-bold">{recipe.name}</h2>
              <p>{recipe.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="mb-4">You haven't added any recipes yet.</p>
          <Button onClick={openModal}>Add Your First Recipe</Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4">Add a New Recipe</h2>
        <RecipeForm />
      </Modal>
    </div>
  );
}
