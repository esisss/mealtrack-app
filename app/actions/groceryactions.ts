'use server';

import {
	getOrCreateShoppingListForCycle,
	getShoppingListWithItems,
	updateShoppingListItemStatus,
} from '@/dal/dal';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T> = {
	success: boolean;
	message: string;
	data?: T;
};

/**
 * Get or create grocery list for the current cycle
 */
export async function getGroceryListAction(cycleId: string) {
	try {
		console.log('[getGroceryListAction] Starting with cycleId:', cycleId);

		const user = await getCurrentUser();
		if (!user) {
			console.log('[getGroceryListAction] User not authenticated');
			return {
				success: false,
				message: 'User not authenticated',
			};
		}

		console.log('[getGroceryListAction] User authenticated:', user.id);

		// Ensure shopping list exists
		const shoppingList = await getOrCreateShoppingListForCycle(
			cycleId,
			user.id
		);
		console.log('[getGroceryListAction] Shopping list:', shoppingList.id);

		// Get the items
		const items = await getShoppingListWithItems(cycleId);
		console.log('[getGroceryListAction] Retrieved items:', items.length);

		return {
			success: true,
			message: 'Grocery list retrieved successfully',
			data: items,
		};
	} catch (error) {
		console.error('[getGroceryListAction] Error:', error);
		return {
			success: false,
			message: `Error getting grocery list: ${
				error instanceof Error ? error.message : String(error)
			}`,
		};
	}
}

/**
 * Toggle grocery item status between 'pending' and 'bought'
 */
export async function toggleGroceryItemStatusAction(
	itemId: string,
	currentStatus: 'pending' | 'bought' | 'skipped'
) {
	try {
		const newStatus = currentStatus === 'bought' ? 'pending' : 'bought';

		await updateShoppingListItemStatus(itemId, newStatus);

		revalidatePath('/pantry');

		return {
			success: true,
			message: 'Item status updated',
			data: { newStatus },
		};
	} catch (error) {
		console.error('Error updating item status:', error);
		return {
			success: false,
			message: `Error updating item status: ${error}`,
		};
	}
}
