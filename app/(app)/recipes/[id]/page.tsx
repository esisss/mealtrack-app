import { RecipeDetailView } from "@/components/recipes/id/RecipeDetailView";
import { getFullRecipeById } from "@/dal/recipe/dal.recipe";
import { notFound } from "next/navigation";
import { z } from "zod";

const IdSchema = z.string().uuid();
export default async function RecipeDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    if (!IdSchema.safeParse(id).success) {
        notFound();
    }
    const recipe = await getFullRecipeById(id);


    if (!recipe) {
        notFound();
    }

    return <RecipeDetailView recipe={recipe} />;
}
