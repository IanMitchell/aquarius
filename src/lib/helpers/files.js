import { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Call with `import.meta.url` to get the `__filename` equivalent
 * @param {string} url - `import.meta.url`
 * @returns {string} `__filename`
 */
export function getFilename(url) {
  return fileURLToPath(url);
}

/**
 * Call with `import.meta.url` to get the `__dirname` equivalent
 * @param {string} url - `import.meta.url`
 * @returns {string} `__dirname`
 */
export function getDirname(url) {
  return dirname(getFilename(url));
}
