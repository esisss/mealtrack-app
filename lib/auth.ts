import { stackServerApp } from '@/stack/server';
import { cache } from 'react';
import { redirect } from 'next/navigation';

export const getCurrentUser = cache(async () => {
	const user = await stackServerApp.getUser();
	return user;
});

export class NotAuthenticatedError extends Error {
	constructor() {
		super('User not authenticated');
		this.name = 'NotAuthenticatedError';
	}
}

export function isNotAuthenticatedError(
	error: unknown
): error is NotAuthenticatedError {
	return error instanceof NotAuthenticatedError;
}

export const requireAuth = cache(async () => {
	const user = await getCurrentUser();
	if (!user) {
		throw new NotAuthenticatedError();
	}

	return user;
});

export async function requireAuthOrRedirect() {
	const user = await getCurrentUser();
	if (!user) {
		redirect('/handler/sign-in');
	}

	return user;
}
