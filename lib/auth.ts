import { stackServerApp } from '@/stack/server';
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
	const user = await stackServerApp.getUser();
	return user;
});
