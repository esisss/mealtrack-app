import { RecipeDetails } from "@/components/recipes/id/RecipeDetails";
import { getRecipeById } from "@/dal/dal";
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
    const recipe = await getRecipeById(id);


    if (!recipe || recipe.length === 0) {
        notFound();
    }

    return <RecipeDetails recipe={recipe[0]} />;
}
