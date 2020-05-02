/**
 * Randomly returns true or false based on the percentage passed in
 * @param {Number} percent - A decimal for the percent pass rate
 * @returns {boolean} A random pass / fail.
 */
export function randomChance(percent) {
  return Math.random() <= percent;
}
