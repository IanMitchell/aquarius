/**
 * Joins an array together in the grammatically correct form
 * @param {Array} array - List of elements to string together
 * @returns {string} The list as a string
 */
export function humanize(array) {
  if (!array) {
    return '';
  }

  switch (array.length) {
    case 0:
      return '';
    case 1:
      return array[0];
    case 2:
      return array.join(' and ');
    default: {
      const [last, ...arr] = array.reverse();
      return `${arr.reverse().join(', ')}, and ${last}`;
    }
  }
}

/**
 * Removes duplicate entries from an Array
 * @param {Array} array - Array of values to reduce to unique values
 * @returns {Array} An array of unique values
 */
export function uniqueValues(array) {
  return Array.from(new Set(array));
}

/**
 * Get a random value from an Array
 * @param {Array} array - Array of objects
 * @return {*} A random element from the Array
 */
export function randomValue(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffles an array inline using the Durstenfield Shuffle
 * @param {Array} array - Array of objects to shuffle
 * @return {Array} A shuffled array
 */
export function shuffle(array) {
  const arr = array;

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const idx = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[idx];
    arr[idx] = temp;
  }

  return arr;
}

/**
 * Determine the difference between two Sets
 * @param {Set} setA - First Set
 * @param {Set} setB - Second Set
 * @returns {Set} Set containing the difference
 */
export function setDifference(setA, setB) {
  return new Set(Array.from(setA).filter((x) => !setB.has(x)));
}
