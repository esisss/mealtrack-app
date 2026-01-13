// isDesktop.ts
export const isDesktop = (minWidth = 1024): boolean => {
	if (typeof window === 'undefined') {
		return false;
	}

	return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
};
