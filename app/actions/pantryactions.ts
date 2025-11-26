'use server';
import { addPantryItems, getPantryItems } from '@/dal/dal';
import { pantryItems } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { checkArrayIncludesNewArrayBy } from '@/utils/checkArrayIncludesNewArrayBy';
import { InferInsertModel } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type PantryItem = InferInsertModel<typeof pantryItems>;

export const addNewPantryItemsAction = async (pantryItems: PantryItem[]) => {
	const user = await getCurrentUser();
	if (!user) {
		return {
			success: false,
			message: 'User not authenticated',
			items: [],
		};
	}
	const existingPantryItems = await getPantryItems(user.id);
	const newPantryItems = checkArrayIncludesNewArrayBy(
		existingPantryItems,
		pantryItems,
		'name'
	).map((item) => ({ ...item, userId: user.id }));
	if (newPantryItems.length === 0) {
		return {
			success: false,
			message: 'No new pantry items to add',
			items: [],
		};
	}
	try {
		const addedItems = await addPantryItems(newPantryItems);
		revalidatePath('/pantry');
		return {
			success: true,
			message: 'Pantry items added successfully',
			items: addedItems,
		};
	} catch (error) {
		console.error('Error adding pantry items:', error);
		return {
			success: false,
			message: `Error adding pantry items: ${error}`,
			items: [],
		};
	}
};
