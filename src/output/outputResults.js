// src/output/outputResults.js
/**
 * Format and print search results to stdout.
 * If results is null/undefined, throw.
 * If results === '__NO_INPUT__', print 'No data found.'
 * If results is empty array, print 'No matches found.'
 * Otherwise, print each result line (string), separated by linebreaks (no extra blank line).
 *
 * @param {string[]|"__NO_INPUT__"} results
 */
export function outputResults(results) {
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
  // Print each line; last line has newline (no blank)
  process.stdout.write(results.join('\n') + '\n');
}