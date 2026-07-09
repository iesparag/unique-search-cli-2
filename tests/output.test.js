// tests/output.test.js
import assert from 'node:assert/strict';
import test from 'node:test';
import { outputResults } from '../src/output/outputResults.js';

function captureStdout(fn) {
  // Captures stdout during fn()
  let output = '';
  const origWrite = process.stdout.write;
  process.stdout.write = (chunk, enc, cb) => {
    output += chunk;
    if (typeof cb === 'function') cb();
    return true;
  };
  try {
    fn();
  } finally {
    process.stdout.write = origWrite;
  }
  return output;
}

test('outputResults: prints matches with line breaks', () => {
  const results = ['foo', 'bar', 'baz'];
  const out = captureStdout(() => outputResults(results));
  assert.strictEqual(out, 'foo\nbar\nbaz\n');
});

test('outputResults: prints "No matches found." when result is empty', () => {
  const out = captureStdout(() => outputResults([]));
  assert.strictEqual(out, 'No matches found.\n');
});

test('outputResults: prints "No data found." for special "__NO_INPUT__" param', () => {
  const out = captureStdout(() => outputResults("__NO_INPUT__"));
  assert.strictEqual(out, 'No data found.\n');
});

test('outputResults: throws TypeError for missing argument', () => {
  assert.throws(() => outputResults(), /results is required/);
});

test('outputResults: throws if argument is wrong type', () => {
  assert.throws(() => outputResults(123), /results must be an array or ".*NO_INPUT.*/);
  assert.throws(() => outputResults({}), /results must be an array or ".*NO_INPUT.*/);
});
