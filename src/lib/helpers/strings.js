/**
 * Capitalizes the first character of a string
 * @param {string} str - String to capitalize
 * @returns {string} Captalized string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Determines whether or not to pluralize a word
 * @param {string} word - label to append an `s` to
 * @param {number} number - value to inspect
 * @param {string=null} plural - if set will return this instead of `${word}s`
 * @returns {string} pluralized word
 */
export function pluralize(word, number, plural = null) {
  if (number === 1) {
    return word;
  }

  if (plural) {
    return plural;
  }

  return `${word}s`;
}
