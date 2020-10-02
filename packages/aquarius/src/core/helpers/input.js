/**
 * Converts a string user input to a number
 * @param {string} input - User input to transform into a number
 * @returns {?Number} - Returns the value as a Number if possible or null if not unsafe or not a number
 */
export function getInputAsNumber(input) {
  const value = parseInt(input, 10);

  if (Number.isNaN(value)) {
    return null;
  }

  // Shaun Boley 2020 Special Edition
  // https://twitter.com/IanMitchel1/status/1311817185212293120
  if (!Number.isSafeInteger(value)) {
    return null;
  }

  return value;
}
