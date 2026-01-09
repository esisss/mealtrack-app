'use server';
import {
	adjustStockQuantity,
	deleteStockLotByLotId,
	getCurrentStockWithDetails,
	getMealPlanEntry,
	getRecipeIngredients,
	getStockLotsByItem,
	markMealConsumption,
} from '@/dal/dal';
import { revalidatePath } from 'next/cache';

export async function markConsumptionAction(
	userId: string,
	mealPlanEntryId: string,
	notes?: string
) {
	console.log('markConsumptionAction', userId, mealPlanEntryId);
	try {
		const stock = await getCurrentStockWithDetails(userId);
		const mealPlanEntry = await getMealPlanEntry(mealPlanEntryId);
		const ingredients = await getRecipeIngredients(mealPlanEntry[0].recipeId);
		for (const ingredient of ingredients) {
			const item = stock.find(
				(item) => item.pantryItemId === ingredient.pantryItemId
			);
			if (item) {
				let qtyToConsume =
					parseFloat(ingredient.qtyPerServing) *
					parseFloat(mealPlanEntry[0].servings);

				if (qtyToConsume > item.totalInStock) {
					throw new Error(
						'Not enough stock for ingredient: ' + ingredient.pantryItemId
					);
				}

				const stockLots = await getStockLotsByItem(
					userId,
					ingredient.pantryItemId
				);
				for (const lot of stockLots) {
					if (qtyToConsume <= 0) break;

					const lotQty = parseFloat(lot.qtyRemaining);
					if (lotQty <= qtyToConsume) {
						// Consume entire lot
						await deleteStockLotByLotId(lot.id);
						qtyToConsume -= lotQty;
					} else {
						// Partially consume lot
						await adjustStockQuantity(lot.id, lotQty - qtyToConsume);
						qtyToConsume = 0;
					}
				}
			}
		}
		await markMealConsumption(userId, mealPlanEntryId, notes);
		revalidatePath('/dashboard');
		return { success: true };
	} catch (error) {
		console.error('[markConsumptionAction] Action failed:', error);
		return { success: false, error: 'Failed to mark consumption' };
	}
}
