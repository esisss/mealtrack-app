'use server';
import {
	getCycleEntries,
	getOrCreateCurrentCycle,
	addMealPlanEntry,
	removeMealPlanEntry,
} from '@/dal/dal';
import { MealCycleInsert, MealCycleSelect, MealPlanEntryInsert } from '@/types';
import { revalidatePath } from 'next/cache';
type ActionResponse<T = undefined> = {
	success: boolean;
	message: string;
	data?: T;
};

const actionWrapper = async <T>(
	action: () => Promise<T>,
	revalidatePaths: string[] = []
): Promise<ActionResponse<T>> => {
	try {
		const data = await action();
		revalidatePaths.forEach((path) => revalidatePath(path));
		return { success: true, message: 'Success', data };
	} catch (error: any) {
		console.error('Action error:', error);
		return {
			success: false,
			message: error.message || 'An unexpected error occurred.',
		};
	}
};

export const getOrCreateCycle = async (
	userId: string
): Promise<ActionResponse<MealCycleInsert>> => {
	return actionWrapper(
		async () => await getOrCreateCurrentCycle(userId, new Date())
	);
};
export const addMealPlanEntryAction = async (
	entry: MealPlanEntryInsert
): Promise<ActionResponse<MealPlanEntryInsert>> => {
	return actionWrapper(async () => {
		const result = await addMealPlanEntry(entry);
		return result[0];
	}, ['/dashboard/planner']);
};
export const removeMealPlanEntryAction = async (
	entryId: string
): Promise<ActionResponse> => {
	return actionWrapper(async () => {
		await removeMealPlanEntry(entryId);
		return undefined;
	}, ['/dashboard/planner']);
};
