// tests/processing.test.js
import assert from 'node:assert/strict';
import test from 'node:test';
import { filterUnique } from '../src/processing/filterUnique.js';

test('filterUnique removes duplicates and preserves order', () => {
  const input = ['a', 'b', 'a', 'c', 'b', 'd', 'e', 'd', 'e', 'f'];
  const expected = ['a', 'b', 'c', 'd', 'e', 'f'];
  assert.deepEqual(filterUnique(input), expected);
});

test('filterUnique works with all unique items', () => {
  const input = ['apple', 'banana', 'cherry'];
  assert.deepEqual(filterUnique(input), input);
});

test('filterUnique returns empty array for empty input', () => {
  assert.deepEqual(filterUnique([]), []);
});

test('filterUnique skips non-string (robustness)', () => {
  const input = ['x', 'y', null, undefined, 42, {}, 'x', 'y', 'z'];
  // Only string values (unique, order preserved)
  assert.deepEqual(filterUnique(input), ['x', 'y', 'z']);
});

test('filterUnique throws on non-array input', () => {
  assert.throws(() => filterUnique(null), /array must be an array/);
  assert.throws(() => filterUnique({}), /array must be an array/);
  assert.throws(() => filterUnique('abc'), /array must be an array/);
});
