"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { RecipeForm } from "@/components/forms/ui/recipe-form";
import { pantryItems, recipes } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { getPantryItems, getRecipeIngredients } from "@/dal/dal";
import { deleteRecipeAction } from "@/app/actions/recipe-form-action";
import { toast } from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RecipeCard } from "./RecipeCard";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type Recipe = InferSelectModel<typeof recipes>;
type PantryItem = InferSelectModel<typeof pantryItems>;

export default function RecipesBoard({ recipes, pantryItems }: { recipes?: Recipe[], pantryItems?: PantryItem[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        recipeId: string | null;
        recipeName: string;
    }>({
        isOpen: false,
        recipeId: null,
        recipeName: "",
    });
    const router = useRouter();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        router.refresh();
    };

    const openEditModal = async (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        // Fetch recipe ingredients
        const ingredients = await getRecipeIngredients(recipe.id);
        setRecipeIngredients(ingredients);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedRecipe(null);
        setRecipeIngredients([]);
        router.refresh();
    };

    const handleDelete = (recipeId: string) => {
        const recipe = recipes?.find(r => r.id === recipeId);
        setDeleteDialog({
            isOpen: true,
            recipeId,
            recipeName: recipe?.name || "this recipe",
        });
    };

    const confirmDelete = async () => {
        const recipeId = deleteDialog.recipeId;
        if (!recipeId) return;

        setIsDeleting(recipeId);
        const result = await deleteRecipeAction(recipeId);

        if (result.success) {
            toast.success("Recipe deleted successfully!");
            router.refresh();
        } else {
            toast.error(result.message || "Failed to delete recipe");
        }
        setIsDeleting(null);
        setDeleteDialog({ isOpen: false, recipeId: null, recipeName: "" });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Your Recipes</h1>
                <Button onClick={openModal}>Add New Recipe</Button>
            </div>
            {recipes && recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            isDeleting={isDeleting}
                            openEditModal={openEditModal}
                            handleDelete={handleDelete}
                        />
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

            <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
                <h2 className="text-xl font-bold mb-4">Edit Recipe</h2>
                {selectedRecipe && (
                    <RecipeForm
                        pantryItems={pantryItems}
                        onSuccess={closeEditModal}
                        initialRecipe={selectedRecipe}
                        recipeIngredients={recipeIngredients}
                        mode="edit"
                    />
                )}
            </Modal>
            <ConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDelete}
                title="Delete Recipe"
                description={`Are you sure you want to delete "${deleteDialog.recipeName}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
            />
        </div >
    );
}
