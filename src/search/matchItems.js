// src/search/matchItems.js
/**
 * Filters an array of items by search query according to options.
 * If uniqueByField is set, elements are objects and only field's value is matched.
 * Otherwise matches entire string/object as string.
 *
 * @param {string[]|object[]} dataset - input items (deduped)
 * @param {string} query
 * @param {object} options
 *   @param {boolean} [options.caseSensitive=false]
 *   @param {boolean} [options.regex=false]
 *   @param {string|undefined} [options.uniqueByField]
 * @returns {string[]|object[]} matched entries
 * @throws {Error} if regex is enabled and query is invalid
 */
export function matchItems(dataset, query, options = {}) {
  if (!Array.isArray(dataset)) throw new TypeError('dataset must be array');
  if (typeof query !== 'string') throw new TypeError('query must be string');
  const {
    caseSensitive = false,
    regex = false,
    uniqueByField,
  } = options;
  if (!query.length) return [];

  let matcher;
  let reg;
  if (regex) {
    let pattern = query;
    let flags = '';
    const regexLiteral = /^\s*\/(.*)\/(\w*)\s*$/;
    const m = pattern.match(regexLiteral);
    if (m) {
      pattern = m[1];
      flags = m[2] || '';
      // Ignore --case-sensitive if flags explicitly provided
    } else {
      flags = caseSensitive ? '' : 'i';
    }
    try {
      reg = new RegExp(pattern, flags);
    } catch (err) {
      throw new Error(`Invalid regular expression pattern: ${err.message}`);
    }
    // Regex: test anywhere in string (no ^$ forced)
    matcher = subj => typeof subj === 'string' && reg.test(subj);
  } else {
    matcher = (subj, pat) => {
      if (typeof subj !== 'string') return false;
      if (caseSensitive) return subj.includes(pat);
      return subj.toLowerCase().includes(pat.toLowerCase());
    };
  }

  // Results:
  if (!uniqueByField) {
    // Strings: match on line (matchItems prev behavior)
    if (regex) {
      return dataset.filter(item => matcher(item));
    } else {
      return dataset.filter(item => matcher(item, query));
    }
  } else {
    // JSON objects: match only on the specified field's value
    // Return the entire object for matching lines
    const matched = [];
    for (const obj of dataset) {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) continue;
      const v = obj[uniqueByField];
      if (v === undefined || v === null) continue;
      let value = String(v);
      let ok = regex ? matcher(value) : matcher(value, query);
      if (ok) matched.push(obj);
    }
    return matched;
  }
}
