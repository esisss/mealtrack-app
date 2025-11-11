'use server';
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

		ingredientsParsed.push({ name: String(name), quantity, baseUnit });
	}

	const schema = z.object({
		recipeName: z
			.string()
			.min(2, { message: 'Recipe name must be at least 2 characters long' })
			.max(30, { message: 'Recipe name must be at most 30 characters long' }),
		description: z
			.string()
			.min(5, { message: 'Description must be at least 5 characters long' })
			.max(500, { message: 'Description must be at most 500 characters long' }),
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
		description: formData.get('description'),
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

	// At this point data is validated and available at parseResult.data
	// TODO: persist to database (call save function)

	return {
		success: true,
		message: 'Validation successful',
	};
};
