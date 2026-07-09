// tests/search.test.js
import assert from 'node:assert/strict';
import test from 'node:test';
import { matchItems } from '../src/search/matchItems.js';

test('matchItems: exact match, case sensitive = false by default', () => {
  const dataset = [
    'foo',
    'FoO',
    'bar',
    'something foo',
    'abc',
    '',
    '  foofoo',
    'FOOBAR'
  ];
  // matches "foo" in any casing
  const result = matchItems(dataset, 'foo');
  assert.deepEqual(result, ['foo','FoO','something foo','  foofoo','FOOBAR']);
});

test('matchItems: exact match, case sensitive = true', () => {
  const dataset = [
    'foo',
    'FoO',
    'FOO',
    'foofoo',
    'Foo',
    'abc'
  ];
  const opts = { caseSensitive: true };
  const result = matchItems(dataset, 'foo', opts);
  assert.deepEqual(result, ['foo','foofoo']);
});

test('matchItems: returns empty if query not found', () => {
  const dataset = ['apple', 'banana', 'cherry'];
  assert.deepEqual(matchItems(dataset, 'pear'), []);
});

test('matchItems: empty query returns empty', () => {
  assert.deepEqual(matchItems(['a', 'b'], ''), []);
});

test('matchItems: ignores non-string input in dataset', () => {
  // Should skip non-string values
  const dataset = ['foo', 42, null, undefined, 'bar', {}, 'foobar'];
  assert.deepEqual(matchItems(dataset, 'foo'), ['foo', 'foobar']);
});

test('matchItems: throws on invalid types', () => {
  assert.throws(() => matchItems(null, 'a'), /dataset must be array/);
  assert.throws(() => matchItems([], 123), /query must be string/);
});
