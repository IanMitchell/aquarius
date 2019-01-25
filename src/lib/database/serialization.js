export function serializeMap(map) {
  const obj = {};

  Array.from(map.entries()).forEach(([key, value]) => {
    obj[key] = value;
  });

  return obj;
}

export function deserializeMap(data) {
  const map = new Map();

  Object.entries(data).forEach(([key, value]) => {
    map.set(key, value);
  });

  return map;
}
