import dateFns from 'date-fns';
import pluralize from 'pluralize';

/**
 * Takes a Date and creates a standard date string from it
 * @param {Date} date - Date to standardize
 * @returns {string} The standardized date string
 */
export function getStandardDate(date) {
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Converts the difference between dates into an exact string representation
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string} The exact time difference
 */
export function getExactTimeInterval(start, end) {
  // CJS / ESM compatibility
  const {
    differenceInYears,
    subYears,
    differenceInMonths,
    subMonths,
    differenceInWeeks,
    subWeeks,
    differenceInDays,
    subDays,
    differenceInHours,
    subHours,
    differenceInMinutes,
    subMinutes,
    differenceInSeconds,
  } = dateFns;

  const units = [];
  let startDate = start;
  let endDate = end;

  if (start > end) {
    startDate = end;
    endDate = start;
  }

  // Years
  const years = differenceInYears(endDate, startDate);

  if (years > 0) {
    endDate = subYears(endDate, years);
    units.push(`${years} ${pluralize('year', years)}`);
  }

  // Months
  const months = differenceInMonths(endDate, startDate);

  if (months > 0) {
    endDate = subMonths(endDate, months);
    units.push(`${months} ${pluralize('month', months)}`);
  }

  // Weeks
  const weeks = differenceInWeeks(endDate, startDate);

  if (weeks > 0) {
    endDate = subWeeks(endDate, weeks);
    units.push(`${weeks} ${pluralize('week', weeks)}`);
  }

  // Days
  const days = differenceInDays(endDate, startDate);

  if (days > 0) {
    endDate = subDays(endDate, days);
    units.push(`${days} ${pluralize('day', days)}`);
  }

  // Hours
  const hours = differenceInHours(endDate, startDate);

  if (hours > 0) {
    endDate = subHours(endDate, hours);
    units.push(`${hours} ${pluralize('hour', hours)}`);
  }

  // Minutes
  const minutes = differenceInMinutes(endDate, startDate);

  if (minutes > 0) {
    endDate = subMinutes(endDate, minutes);
    units.push(`${minutes} ${pluralize('minute', minutes)}`);
  }

  // Seconds
  const seconds = differenceInSeconds(endDate, startDate);

  if (seconds > 0) {
    units.push(`${seconds} ${pluralize('second', seconds)}`);
  }

  return units.join(' ');
}
