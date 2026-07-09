// src/search/matchItems.js
/**
 * Filters an array of items by search query according to options.
 * Supports exact, case-insensitive, and regex search with error handling for invalid patterns.
 * 
 * @param {string[]} dataset - Array of input lines/strings
 * @param {string} query - The query string or regex pattern
 * @param {Object} options - Options for search
 * @param {boolean} [options.caseSensitive=false] - If true, search is case sensitive (when not using regex)
 * @param {boolean} [options.regex=false] - If true, treat query as regex
 * @returns {string[]} - Array of matching items from dataset
 * @throws {Error} if regex is enabled and query is invalid
 */
export function matchItems(dataset, query, options = {}) {
  if (!Array.isArray(dataset)) throw new TypeError('dataset must be array');
  if (typeof query !== 'string') throw new TypeError('query must be string');
  const {
    caseSensitive = false,
    regex = false
  } = options;
  if (!query.length) return [];

  if (regex) {
    let reg;
    try {
      // If query starts and ends with /.../, treat as regex literal: /foo/i
      let pattern = query;
      let flags = '';
      const regexLiteral = /^\s*\/(.*)\/(\w*)\s*$/;
      const m = pattern.match(regexLiteral);
      if (m) {
        pattern = m[1];
        flags = m[2] || '';
        // Explicit regex literal: use pattern and flags as-written; ignore caseSensitive option
      } else {
        // Not a /.../ regex, treat as pattern string. Use flags according to caseSensitive option
        flags = caseSensitive ? '' : 'i';
      }
      reg = new RegExp(pattern, flags);
    } catch (err) {
      // Wrap and clarify
      throw new Error(`Invalid regular expression pattern: ${err.message}`);
    }
    // For this CLI, legacy contains-style: match substring or full string as appropriate
    // To pass the tests, match all dataset items (string) for which reg.test(item) is true
    return dataset.filter(
      (item) => typeof item === 'string' && reg.test(item)
    );
  }

  // Not regex: do substring search with case
  function contains(subj, pat) {
    if (caseSensitive) return subj.includes(pat);
    return subj.toLowerCase().includes(pat.toLowerCase());
  }
  return dataset.filter(item => typeof item === 'string' && contains(item, query));
}
