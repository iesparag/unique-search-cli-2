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

test('filterUnique on JSON, unique by key', () => {
  const arr = [
    {x: 1, z: "a"},
    {x: 2, z: "b"},
    {x: 1, z: "c"},
    {y: 1},
    {x: 3},
    {x: null},
    {x: 2, z: "d"},
    [1,2,3],
    {x: undefined},
    {x: 4},
  ];
  const filtered = filterUnique(arr, 'x');
  // x=1,2,3,null,undefined,4; first per key
  assert.deepEqual(filtered, [
    {x:1,z:"a"},
    {x:2,z:"b"},
    {x:3},
    {x:null},
    {x:undefined},
    {x:4}
  ]);
});
