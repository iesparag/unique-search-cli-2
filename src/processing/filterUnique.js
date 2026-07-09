// src/processing/filterUnique.js
/**
 * Removes duplicate elements from an array.
 * If uniqueByKey is provided, the array is of objects and unique is by uniqueByKey field value.
 *   Objects missing the key cause a warning to stderr and are skipped.
 * Otherwise, acts as previous: unique string values only.
 *
 * @param {string[]|object[]} array
 * @param {string|undefined} uniqueByKey - key to dedupe objects on (for JSON)
 * @returns {string[]|object[]} unique items
 */
export function filterUnique(array, uniqueByKey) {
  if (!Array.isArray(array)) {
    throw new TypeError('array must be an array');
  }
  if (!uniqueByKey) {
    // Use a Set to track seen values. Only first occurrence kept.
    const seen = new Set();
    const result = [];
    for (const item of array) {
      if (typeof item !== 'string') continue;
      if (!seen.has(item)) {
        seen.add(item);
        result.push(item);
      }
    }
    return result;
  } else {
    // Dedupe by key on object lines
    const seen = new Set();
    const result = [];
    let idx = 0;
    for (const obj of array) {
      idx++;
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        process.stderr.write(`Skipping line ${idx}: Not a JSON object\n`);
        continue;
      }
      if (!(uniqueByKey in obj)) {
        process.stderr.write(`Warning: Skipping object missing key '${uniqueByKey}' at line ${idx}\n`);
        continue;
      }
      const keyValue = obj[uniqueByKey];
      // stringifies key for strict set comparison
      // Use type+value, so undefined and "undefined" are separate; but null and undefined must not alias
      let keyStr;
      if (keyValue === undefined) {
        keyStr = '__undefined__';
      } else if (keyValue === null) {
        keyStr = '__null__';
      } else {
        keyStr = String(keyValue);
      }
      if (!seen.has(keyStr)) {
        seen.add(keyStr);
        result.push(obj);
      }
    }
    return result;
  }
}
