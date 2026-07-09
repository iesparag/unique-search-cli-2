// src/processing/filterUnique.js
/**
 * Removes duplicate elements from an array (by exact item value), preserving order.
 * Assumes items are strings (default CLI use case).
 *
 * @param {string[]} array
 * @returns {string[]}
 */
export function filterUnique(array) {
  if (!Array.isArray(array)) {
    throw new TypeError('array must be an array');
  }
  // Use a Set to track seen values. Only first occurrence of each unique string is kept.
  const seen = new Set();
  const result = [];
  for (const item of array) {
    // For robustness, only dedupe string values
    if (typeof item !== 'string') continue;
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}
