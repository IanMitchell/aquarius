/**
 * Get a random value from an Array
 * @param {Array} array - Array of objects
 * @return {*} A random element from the Array
 */
export function randomValue<T>(array: Array<T>) {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffles an array inline using the Durstenfield Shuffle
 * @param {Array} array - Array of objects to shuffle
 * @return {Array} A shuffled array
 */
export function shuffle<T>(array: Array<T>) {
	const arr = array;

	for (let i = arr.length - 1; i > 0; i -= 1) {
		const idx = Math.floor(Math.random() * (i + 1));
		const temp = arr[i];
		arr[i] = arr[idx];
		arr[idx] = temp;
	}

	return arr;
}
