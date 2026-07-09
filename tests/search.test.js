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

test('matchItems: supports case-insensitive and regex search', () => {
  const dataset = [
    'Error: foo',
    'Warning: foo',
    'error: bar',
    'Warn: bar',
    'FOOBAR',
    'woops',
    'regex rocks',
    ' ReGeX is great ',
    '123abc',
    'abc123',
  ];
  // Case-insensitive regex: \berror\b
  let r = matchItems(dataset, '\berror\b', { regex: true });
  assert.deepEqual(r, ['Error: foo', 'error: bar']);

  // Case-sensitive regex: only capital 'Error'
  r = matchItems(dataset, '^Error:', { regex: true, caseSensitive: true });
  assert.deepEqual(r, ['Error: foo']);
});

test('matchItems: regex supports `/pattern/flags` syntax', () => {
  const dataset = [ 'Apple', 'aPPle', 'apple', 'pear', 'APPLE', 'banana', 'mapple' ];

  // Should match all case-insensitive: /apple/i
  let r = matchItems(dataset, '/apple/i', { regex: true });
  assert.deepEqual(r, ['Apple','aPPle','apple','APPLE','mapple']);

  // Should match only lower case 'apple' (no "i" flag, so case sensitive)
  r = matchItems(dataset, '/apple/', { regex: true });
  assert.deepEqual(r, ['apple','mapple']);

  // Should match only all-caps 'APPLE' (case sensitive)
  r = matchItems(dataset, '/APPLE/', { regex: true, caseSensitive: true });
  assert.deepEqual(r, ['APPLE','mapple']);
});

test('matchItems: throws for invalid regex pattern', () => {
  const dataset = ['should not match'];
  assert.throws(
    () => matchItems(dataset, '[unterminated', { regex: true }),
    /Invalid regular expression pattern/
  );
  assert.throws(
    () => matchItems(dataset, '/[unterminated/', { regex: true }),
    /Invalid regular expression pattern/
  );
});
