// src/output/outputResults.js
/**
 * Format and print search results to stdout.
 * If results is null/undefined, throw.
 * If results === '__NO_INPUT__', print 'No data found.'
 * If results is empty array, print 'No matches found.'
 * Otherwise, print each result line (string or JSON), separated by linebreaks (no extra blank line).
 * If opts.json is true, results are objects and are stringified
 *
 * @param {string[]|object[]|"__NO_INPUT__"} results
 * @param {object} [opts]
 *   @param {boolean} [opts.json] - if true, print JSON.stringify for each result
 */
export function outputResults(results, opts = {}) {
  const { json = false } = opts;
  if (results === undefined || results === null) {
    throw new TypeError('results is required');
  }
  if (results === '__NO_INPUT__') {
    process.stdout.write('No data found.\n');
    return;
  }
  if (!Array.isArray(results)) {
    throw new TypeError('results must be an array or "__NO_INPUT__"');
  }
  if (results.length === 0) {
    process.stdout.write('No matches found.\n');
    return;
  }
  if (json) {
    for (let i = 0; i < results.length; ++i) {
      process.stdout.write(JSON.stringify(results[i]));
      process.stdout.write('\n');
    }
  } else {
    process.stdout.write(results.join('\n') + '\n');
  }
}
