import { RecipeSelect } from "@/types"

export const RecipeDetails = ({ recipe }: { recipe: RecipeSelect | null }) => {

    return (
        <div>{recipe?.name}</div>
    )
}
