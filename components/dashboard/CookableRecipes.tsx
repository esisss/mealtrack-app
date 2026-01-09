import { RecipeSelect } from "@/types";
import { ChefHatIcon } from "lucide-react";

interface CookableRecipesProps {
    recipes: RecipeSelect[];
}

export const CookableRecipes = ({ recipes }: CookableRecipesProps) => {
    if (recipes.length === 0) return null;

    return (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ">
            <div className="flex items-center gap-3 mb-6">
                <ChefHatIcon className="text-primary w-6 h-6" />
                <h2 className="text-xl font-bold">Ready to Cook Right Now</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="group relative bg-sidebar p-5 rounded-2xl border  shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 "
                    >
                        <div className="cursor-pointer flex justify-between items-start mb-3">
                            <h3 className="font-bold text-sidebar-text leading-snug transition-colors">
                                {recipe.name}
                            </h3>
                        </div>

                        {recipe.notes && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 italic">
                                &quot;{recipe.notes}&quot;
                            </p>
                        )}

                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2">

                                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                                    In Stock
                                </span>
                            </div>

                            <button className="cursor-pointer text-xs font-medium text-gray-400 group-hover:text-primary flex items-center gap-1 transition-colors">
                                View Recipe
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m9 18 6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
