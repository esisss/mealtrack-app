import React from 'react'
import { RecipeSelect } from '@/types'
import Image from 'next/image'
import { Button } from '../ui/button'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const RecipeCard = ({ recipe, isDeleting, openEditModal, handleDelete }: { recipe: RecipeSelect, isDeleting: string | null, openEditModal: (recipe: RecipeSelect) => void, handleDelete: (recipeId: string) => void }) => {
    return (
        <div key={recipe.id} className="border p-4 rounded-lg relative group hover:shadow-lg transition-shadow">
            {recipe.imageUrl && (
                <div className="w-full h-40 relative mb-3 rounded-md overflow-hidden">
                    <Image
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <div className="w-full flex justify-between items-center">

                <h2 className="font-bold text-lg mb-2">{recipe.name}</h2>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="cursor-pointer border border-white/10 p-2 rounded-md outline-none selected:outline-none focus:outline-none">

                            <EllipsisVertical size={20} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Recipe Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditModal(recipe)}>
                            <Pencil size={20} className="mr-2" />
                            Edit Recipe
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(recipe.id)}>
                            <Trash2 size={20} className="mr-2 text-red-400" />
                            Delete Recipe
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{recipe.notes}</p>

            <div className="flex gap-2 mt-4">
                <Button variant='default' className='cursor-pointer' >
                    <Link href={`/recipes/${recipe.id}`}  >
                        View Recipe
                    </Link>
                </Button>

            </div>
        </div>
    )
}
