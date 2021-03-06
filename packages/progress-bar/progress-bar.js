/**
 * Creates a textual representation of a progress bar to embed in a message.
 * @param {number} percent - The percent of the progress bar to fill. **It should be in decimal form - if it is greater than 1 it will be divided by 100.**
 * @param {number} [characterCount=10] - The number of characters to use to display the progress bar
 * @param {string} [emptyCharacter='▱'] - The character to use for the unfilled portion of the progress bar. Recommended to use the default or a zero-width space
 * @returns {string} The string form of the progress bar
 */
export function createProgressBar(
  percent,
  characterCount = 10,
  emptyCharacter = '▱'
) {
  let value = percent;

  if (percent > 1) {
    value = percent / 100;
  }

  const fill = Math.round(value * characterCount);
  return `[${'▰'.repeat(fill)}${emptyCharacter.repeat(
    characterCount - fill
  )}]`.slice(0, characterCount + 2);
}
