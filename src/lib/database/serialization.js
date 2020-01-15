/**
 * Converts a Map into a JSON Object
 * @param {Map} map - Map to convert into a JSON Object
 * @returns {Object} map in JSON Object form
 */
export function serializeMap(map) {
  const obj = {};

  Array.from(map.entries()).forEach(([key, value]) => {
    obj[key] = value;
  });

  return obj;
}

/**
 * Converts a stored JSON Object into a Map
 * @param {Object} data - JSON Object to convert into a Map
 * @returns {Map} data in Map form
 */
export function deserializeMap(data) {
  const map = new Map();

  Object.entries(data).forEach(([key, value]) => {
    map.set(key, value);
  });

  return map;
}
