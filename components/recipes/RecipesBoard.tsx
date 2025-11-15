"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { RecipeForm } from "@/components/forms/ui/recipe-form";
import { pantryItems, recipes } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { getPantryItems } from "@/dal/dal";

// Simulate the shape of a recipe



type Recipe = InferSelectModel<typeof recipes>;
type PantryItem = InferSelectModel<typeof pantryItems>;


export default function RecipesBoard({ recipes, pantryItems }: { recipes?: Recipe[], pantryItems?: PantryItem[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);



    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Your Recipes</h1>
                <Button onClick={openModal}>Add New Recipe</Button>
            </div>
            {recipes && recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="border p-4 rounded-lg">
                            <h2 className="font-bold">{recipe.name}</h2>
                            <p>{recipe.notes}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="mb-4">You haven&apos;t added any recipes yet.</p>
                    <Button onClick={openModal}>Add Your First Recipe</Button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2 className="text-xl font-bold mb-4">Add a New Recipe</h2>
                <RecipeForm pantryItems={pantryItems} onSuccess={closeModal} />
            </Modal>
        </div>
    );
}
