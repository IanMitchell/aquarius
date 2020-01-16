/**
 * Capitalizes the first character of a string
 * @param {string} str - String to capitalize
 * @returns {string} Captalized string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
