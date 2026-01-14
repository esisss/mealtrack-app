/**
 * Parses a "YYYY-MM-DD" string into a Date object at local midnight.
 * This prevents the "previous day" issue caused by automatic UTC conversion
 * when using new Date("YYYY-MM-DD").
 */
export function parseLocalDate(dateStr: string): Date {
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Formats a Date object into a "YYYY-MM-DD" string using local time parts.
 * This avoids the shift that happens with .toISOString() in non-UTC timezones.
 */
export function formatLocalDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Returns today's date at local midnight.
 */
export function getTodayLocal(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Compares two "YYYY-MM-DD" strings or Date objects for equality.
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
	const d1 = typeof date1 === 'string' ? date1 : formatLocalDate(date1);
	const d2 = typeof date2 === 'string' ? date2 : formatLocalDate(date2);
	return d1 === d2;
}
/**
 * Checks if a Date object is before today (local time).
 */
export function isBeforeToday(date: Date): boolean {
	const today = getTodayLocal();
	return date < today;
}
