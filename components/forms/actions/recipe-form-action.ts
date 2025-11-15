'use server';
import {
	addPantryItems,
	addRecipe,
	addRecipeIngredients,
	getPantryItems,
} from '@/dal/dal';
import { stackServerApp } from '@/stack/server';
import { checkArrayIncludesNewArrayBy } from '@/utils/checkArrayIncludesNewArrayBy';
import { log } from 'console';
import z from 'zod';

export type RecipeActionResponse = {
	success: boolean;
	message: string;
	errors?: Record<string, string[]>;
};
export const validateAndSendRecipe = async (
	formData: FormData
): Promise<RecipeActionResponse> => {
	// Parse incoming fields
	const entries = Object.fromEntries(formData.entries());
	// Build ingredients array from convention ingredients[0][name], ingredients[0][qty], ...
	const ingredientsParsed: Array<{
		name: string;
		quantity: number;
		baseUnit: string;
		pantryItemId: string;
	}> = [];

	for (let i = 0; ; i++) {
		const prefix = `ingredients[${i}]`;
		const name = formData.get(`${prefix}[name]`);
		if (!name) break; // no more ingredients

		const quantityRaw = formData.get(`${prefix}[qty]`);
		const quantity =
			typeof quantityRaw === 'string' || typeof quantityRaw === 'number'
				? Number(quantityRaw)
				: NaN;
		const baseUnit = (formData.get(`${prefix}[baseUnit]`) as string) || '';
		const pantryItemId =
			(formData.get(`${prefix}[pantryItemId]`) as string) || '';
		ingredientsParsed.push({
			name: String(name),
			quantity,
			baseUnit,
			pantryItemId,
		});
	}

	const schema = z.object({
		recipeName: z
			.string()
			.min(2, { message: 'Recipe name must be at least 2 characters long' })
			.max(30, { message: 'Recipe name must be at most 30 characters long' }),
		notes: z
			.string()
			.min(5, { message: 'Notes must be at least 5 characters long' })
			.max(500, { message: 'Notes must be at most 500 characters long' }),
		ingredients: z
			.array(
				z.object({
					name: z.string().min(1, { message: 'Ingredient name is required' }),
					quantity: z
						.number()
						.positive({ message: 'Quantity must be a positive number' }),
					baseUnit: z.string().min(1, { message: 'Base unit is required' }),
				})
			)
			.min(1, { message: 'At least one ingredient is required' }),
	});

	// Run validation and return structured response
	const parseResult = await schema.safeParseAsync({
		recipeName: formData.get('recipeName'),
		notes: formData.get('notes'),
		ingredients: ingredientsParsed,
	});

	if (!parseResult.success) {
		// Use Zod's error.flatten() to get a map of field errors
		const flattened = parseResult.error.flatten();
		return {
			success: false,
			message: 'Validation failed',
			errors: flattened.fieldErrors as Record<string, string[]>,
		};
	}
	const user = await stackServerApp.getUser();
	if (!user) {
		return {
			success: false,
			message: 'User not authenticated',
		};
	}
	const pantryItems = await getPantryItems(user.id);
	const newPantryItems = checkArrayIncludesNewArrayBy(
		pantryItems,
		ingredientsParsed,
		'name'
	);
	if (newPantryItems.length >= 1) {
		console.log('New ingredient IDs to add to pantry:', newPantryItems);
		try {
			const addedPantryItems = await addPantryItems(newPantryItems);
			// Update ingredientsParsed with the added pantry items
			addedPantryItems.forEach((pantryItem) => {
				const index = ingredientsParsed.findIndex(
					(ing) =>
						ing.name.toLowerCase().trim() ===
						pantryItem.name.toLowerCase().trim()
				);
				if (index !== -1) {
					ingredientsParsed[index] = {
						...ingredientsParsed[index],
						...pantryItem,
					};
				}
			});

			log('All new pantry items added successfully.');
		} catch (error) {
			log('Error adding new pantry items:', error);
			return {
				success: false,
				message: 'Error adding new pantry items',
			};
		}
	}
	const recipe = {
		name: parseResult.data.recipeName,
		notes: parseResult.data.notes,
		userId: user.id,
	};
	const addedRecipe = await addRecipe(recipe);
	if (!addedRecipe) {
		return {
			success: false,
			message: 'Error adding new recipe',
		};
	}

	// Add recipe ingredients
	const recipeIngredientsToAdd = ingredientsParsed.map((ingredient) => ({
		recipeId: addedRecipe[0].id,
		pantryItemId: ingredient.pantryItemId!,
		qtyPerServing: ingredient.quantity.toString(),
		notes: '',
	}));
	try {
		const addedRecipeIngredients = await addRecipeIngredients(
			recipeIngredientsToAdd
		);
		log('Recipe ingredients added successfully:', addedRecipeIngredients);
	} catch (error) {
		log('Error adding recipe ingredients:', error);
		return {
			success: false,
			message: 'Error adding recipe ingredients',
		};
	}

	log('New recipe added successfully:', addedRecipe);
	return {
		success: true,
		message: 'Validation successful, recipe added',
	};
};
