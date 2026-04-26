'use server';
import {
	addPantryItems,
	addRecipe,
	addRecipeIngredients,
	getPantryItems,
	deleteRecipe,
	deleteRecipeIngredients,
	updateRecipe,
	updateRecipeIngredients,
	getRecipeIngredients,
	updateShoppingListForCycle,
} from '@/dal/dal';
import { isNotAuthenticatedError, requireAuth } from '@/lib/auth';
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
		fixedBuyQty: number | undefined;
		pantryItemId: string;
	}> = [];
	console.log('Form data:', entries);
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
		const fixedBuyQty = formData.get(`${prefix}[fixedBuyQty]`);
		const pantryItemId =
			(formData.get(`${prefix}[pantryItemId]`) as string) || '';
		ingredientsParsed.push({
			name: String(name),
			quantity,
			baseUnit,
			fixedBuyQty:
				fixedBuyQty !== null && fixedBuyQty !== ''
					? Number(fixedBuyQty)
					: undefined,
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
					fixedBuyQty: z
						.number()
						.min(100, { message: 'Fixed buy qty must be at least 100' })
						.optional(),
				})
			)
			.min(1, { message: 'At least one ingredient is required' }),
		publicImageId: z.string().optional(),
		imageUrl: z.string().optional(),
		cookTime: z.number().optional(),
		prepTime: z.number().optional(),
		servings: z.number().optional(),
		instructions: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
	});

	// Build instructions and tags from form data
	const instructions: string[] = [];
	for (let i = 0; ; i++) {
		const instruction = formData.get(`instructions[${i}]`);
		if (!instruction) break;
		instructions.push(String(instruction));
	}

	const tags: string[] = [];
	for (let i = 0; ; i++) {
		const tag = formData.get(`tags[${i}]`);
		if (!tag) break;
		tags.push(String(tag));
	}

	// Run validation and return structured response
	const parseResult = await schema.safeParseAsync({
		recipeName: formData.get('recipeName'),
		notes: formData.get('notes'),
		ingredients: ingredientsParsed,
		publicImageId: formData.get('public_id')?.toString() || '',
		imageUrl: formData.get('secure_url')?.toString() || '',
		cookTime: formData.get('cookTime')
			? Number(formData.get('cookTime'))
			: undefined,
		prepTime: formData.get('prepTime')
			? Number(formData.get('prepTime'))
			: undefined,
		servings: formData.get('servings')
			? Number(formData.get('servings'))
			: undefined,
		instructions: instructions.length > 0 ? instructions : undefined,
		tags: tags.length > 0 ? tags : undefined,
	});
	console.log(parseResult.data);
	if (!parseResult.success) {
		// Use Zod's error.flatten() to get a map of field errors
		const flattened = parseResult.error.flatten();
		return {
			success: false,
			message: 'Validation failed',
			errors: flattened.fieldErrors as Record<string, string[]>,
		};
	}
	const user = await requireAuth().catch((error) => {
		if (isNotAuthenticatedError(error)) {
			return null;
		}

		throw error;
	});
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
	).map((item) => ({
		...item,
		userId: user.id,
		fixedBuyQty: item.fixedBuyQty ? item.fixedBuyQty.toString() : null,
	}));
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
	console.log('New recipe:', parseResult.data);
	const recipe = {
		name: parseResult.data.recipeName,
		notes: parseResult.data.notes,
		userId: user.id,
		publicImageId: parseResult.data.publicImageId,
		imageUrl: parseResult.data.imageUrl,
		cookTime: parseResult.data.cookTime?.toString(),
		prepTime: parseResult.data.prepTime?.toString(),
		servings: parseResult.data.servings?.toString(),
		instructions: parseResult.data.instructions,
		tags: parseResult.data.tags,
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

export const deleteRecipeAction = async (
	recipeId: string
): Promise<RecipeActionResponse> => {
	const user = await requireAuth().catch((error) => {
		if (isNotAuthenticatedError(error)) {
			return null;
		}

		throw error;
	});
	if (!user) {
		return {
			success: false,
			message: 'User not authenticated',
		};
	}

	try {
		// Delete recipe ingredients first (cascade)
		await deleteRecipeIngredients(recipeId);
		// Delete the recipe
		await deleteRecipe(recipeId);

		log('Recipe deleted successfully:', recipeId);
		return {
			success: true,
			message: 'Recipe deleted successfully',
		};
	} catch (error) {
		log('Error deleting recipe:', error);
		return {
			success: false,
			message: 'Error deleting recipe',
		};
	}
};

export const updateRecipeAction = async (
	recipeId: string,
	formData: FormData
): Promise<RecipeActionResponse> => {
	// Parse incoming fields (same as validateAndSendRecipe)
	const entries = Object.fromEntries(formData.entries());
	const ingredientsParsed: Array<{
		name: string;
		quantity: number;
		baseUnit: string;
		fixedBuyQty: number | undefined;
		pantryItemId: string;
	}> = [];

	for (let i = 0; ; i++) {
		const prefix = `ingredients[${i}]`;
		const name = formData.get(`${prefix}[name]`);
		if (!name) break;

		const quantityRaw = formData.get(`${prefix}[qty]`);
		const quantity =
			typeof quantityRaw === 'string' || typeof quantityRaw === 'number'
				? Number(quantityRaw)
				: NaN;
		const baseUnit = (formData.get(`${prefix}[baseUnit]`) as string) || '';
		const fixedBuyQty = formData.get(`${prefix}[fixedBuyQty]`);
		const pantryItemId =
			(formData.get(`${prefix}[pantryItemId]`) as string) || '';
		ingredientsParsed.push({
			name: String(name),
			quantity,
			baseUnit,
			fixedBuyQty:
				fixedBuyQty !== null && fixedBuyQty !== ''
					? Number(fixedBuyQty)
					: undefined,
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
					fixedBuyQty: z
						.number()
						.min(100, { message: 'Fixed buy qty must be at least 100' })
						.optional(),
				})
			)
			.min(1, { message: 'At least one ingredient is required' }),
		publicImageId: z.string().optional(),
		imageUrl: z.string().optional(),
		cookTime: z.number().optional(),
		prepTime: z.number().optional(),
		servings: z.number().optional(),
		instructions: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
	});

	// Build instructions and tags from form data
	const instructions: string[] = [];
	for (let i = 0; ; i++) {
		const instruction = formData.get(`instructions[${i}]`);
		if (!instruction) break;
		instructions.push(String(instruction));
	}

	const tags: string[] = [];
	for (let i = 0; ; i++) {
		const tag = formData.get(`tags[${i}]`);
		if (!tag) break;
		tags.push(String(tag));
	}

	const parseResult = await schema.safeParseAsync({
		recipeName: formData.get('recipeName'),
		notes: formData.get('notes'),
		ingredients: ingredientsParsed,
		publicImageId: formData.get('public_id')?.toString() || '',
		imageUrl: formData.get('secure_url')?.toString() || '',
		cookTime: formData.get('cookTime')
			? Number(formData.get('cookTime'))
			: undefined,
		prepTime: formData.get('prepTime')
			? Number(formData.get('prepTime'))
			: undefined,
		servings: formData.get('servings')
			? Number(formData.get('servings'))
			: undefined,
		instructions: instructions.length > 0 ? instructions : undefined,
		tags: tags.length > 0 ? tags : undefined,
	});

	if (!parseResult.success) {
		const flattened = parseResult.error.flatten();
		return {
			success: false,
			message: 'Validation failed',
			errors: flattened.fieldErrors as Record<string, string[]>,
		};
	}

	const user = await requireAuth().catch((error) => {
		if (isNotAuthenticatedError(error)) {
			return null;
		}

		throw error;
	});
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
	).map((item) => ({
		...item,
		userId: user.id,
		fixedBuyQty: item.fixedBuyQty ? item.fixedBuyQty.toString() : null,
	}));

	if (newPantryItems.length >= 1) {
		try {
			const addedPantryItems = await addPantryItems(newPantryItems);
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
		} catch (error) {
			log('Error adding new pantry items:', error);
			return {
				success: false,
				message: 'Error adding new pantry items',
			};
		}
	}

	const recipeUpdate = {
		name: parseResult.data.recipeName,
		notes: parseResult.data.notes,
		publicImageId: parseResult.data.publicImageId,
		imageUrl: parseResult.data.imageUrl,
		cookTime: parseResult.data.cookTime?.toString(),
		prepTime: parseResult.data.prepTime?.toString(),
		servings: parseResult.data.servings?.toString(),
		instructions: parseResult.data.instructions,
		tags: parseResult.data.tags,
	};

	try {
		// Update recipe
		const updatedRecipe = await updateRecipe(recipeId, recipeUpdate);

		if (!updatedRecipe) {
			return {
				success: false,
				message: 'Error updating recipe',
			};
		}

		// Update recipe ingredients
		const recipeIngredientsToUpdate = ingredientsParsed.map((ingredient) => ({
			recipeId: recipeId,
			pantryItemId: ingredient.pantryItemId!,
			qtyPerServing: ingredient.quantity.toString(),
			notes: '',
		}));

		await updateRecipeIngredients(recipeId, recipeIngredientsToUpdate);

		log('Recipe updated successfully:', updatedRecipe);
		return {
			success: true,
			message: 'Recipe updated successfully',
		};
	} catch (error) {
		log('Error updating recipe:', error);
		return {
			success: false,
			message: 'Error updating recipe',
		};
	}
};
