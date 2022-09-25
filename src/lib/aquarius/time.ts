import { formatDuration, intervalToDuration } from "date-fns";

// Seconds
export const ONE_SECOND = 1000;

// Minutes
export const ONE_MINUTE = 60 * ONE_SECOND;
export const FIVE_MINUTES = 5 * ONE_MINUTE;
export const TEN_MINUTES = 10 * ONE_MINUTE;
export const THIRTY_MINUTES = 30 * ONE_MINUTE;

// Hours
export const ONE_HOUR = 60 * ONE_MINUTE;

// Days
export const ONE_DAY = 24 * ONE_HOUR;

// Weeks
export const ONE_WEEK = 7 * ONE_DAY;

export function getExactTimeInterval(start: Date, end: Date) {
	const duration = intervalToDuration({
		start,
		end,
	});

	return formatDuration(duration, { zero: true });
}
