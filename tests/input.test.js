// tests/input.test.js
import assert from 'node:assert/strict';
import test from 'node:test';
import { readInput } from '../src/input/readInput.js';
import fs from 'node:fs';
import path from 'node:path';
import { PassThrough } from 'node:stream';

// Helper for temp file creation
function makeTempFile(contents) {
  const tmpDir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-test-'));
  const filePath = path.join(tmpDir, 'sample.txt');
  fs.writeFileSync(filePath, contents, { encoding: 'utf8' });
  return { filePath, tmpDir };
}

test('readInput reads lines from a file', async (t) => {
  const content = 'foo\nbar\nbaz\n';
  const { filePath, tmpDir } = makeTempFile(content);
  try {
    const res = await readInput(filePath);
    assert.deepEqual(res, ['foo', 'bar', 'baz']);
  } finally {
    // Cleanup tempdir
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('readInput rejects on file not found', async () => {
  await assert.rejects(
    () => readInput('/path/to/does-not-exist-file.txt'),
    /Input file not found/
  );
});

test('readInput reads lines from simulated stdin', async (t) => {
  // Patch process.stdin to a PassThrough stream
  const origStdin = process.stdin;
  const pt = new PassThrough();
  pt.end('one\ntwo\nthree\n'); // end so readline gets EOF
  Object.defineProperty(process, 'stdin', {
    value: pt,
    configurable: true,
    writable: true
  });
  try {
    const res = await readInput();
    assert.deepEqual(res, ['one', 'two', 'three']);
  } finally {
    // Restore stdin
    Object.defineProperty(process, 'stdin', {
      value: origStdin,
      configurable: true,
      writable: true
    });
  }
});

test('readInput throws if no file and stdin is TTY', async (t) => {
  // Patch process.stdin to be TTY
  const origIsTTY = process.stdin.isTTY;
  Object.defineProperty(process.stdin, 'isTTY', {
    value: true,
    configurable: true
  });
  try {
    await assert.rejects(
      () => readInput(),
      /No input file provided and no data piped via stdin/
    );
  } finally {
    Object.defineProperty(process.stdin, 'isTTY', {
      value: origIsTTY,
      configurable: true
    });
  }
});

test('readInput can parse JSON lines and gives objects, skips bad JSON', async () => {
  const lines = `{"x":1,"foo":"bar"}\n{"x":2}\nnot-a-json\n{"y":100}\n{"x":3}\n{"x":null}\n[1,2,3]\n{"x":4}`;
  // Make temp file
  const { filePath, tmpDir } = makeTempFile(lines);
  try {
    const res = await readInput(filePath, { jsonLines: true });
    // Only lines with { x: ... } objects, except for missing 'x' (we do not filter here)
    assert.ok(res.every(o => typeof o === 'object' && !Array.isArray(o) && o !== null));
    // Should parse all object lines, skip bad lines and arrays
    assert.deepEqual(res, [
      { x: 1, foo: 'bar' },
      { x: 2 },
      { y: 100 }, // not filtered here
      { x: 3 },
      { x: null },
      { x: 4 }
    ]);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
