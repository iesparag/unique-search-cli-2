// src/search/matchItems.js
/**
 * Filters an array of items by search query according to options.
 * @param {string[]} dataset - Array of input lines/strings
 * @param {string} query - The query string
 * @param {Object} options - Options for search
 * @param {boolean} [options.caseSensitive=false] - If true, search is case sensitive
 * @returns {string[]} - Array of matching items from dataset
 */
export function matchItems(dataset, query, options = {}) {
  if (!Array.isArray(dataset)) throw new TypeError('dataset must be array');
  if (typeof query !== 'string') throw new TypeError('query must be string');
  const { caseSensitive = false } = options;
  if (!query.length) return [];

  // Function to test single item for containment of query, with case
  function contains(subj, pat) {
    if (caseSensitive) return subj.includes(pat);
    return subj.toLowerCase().includes(pat.toLowerCase());
  }
  return dataset.filter(item => typeof item === 'string' && contains(item, query));
}
