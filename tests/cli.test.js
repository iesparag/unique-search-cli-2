// tests/cli.test.js
import assert from 'node:assert/strict';
import test from 'node:test';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Helper to run unique-search binary
function runCLI(args, input = null) {
  return new Promise((resolve) => {
    const bin = path.join(process.cwd(), 'bin/unique-search');
    const proc = execFile('node', [bin, ...args], {
      env: Object.assign({}, process.env),
      encoding: 'utf8',
      maxBuffer: 1024 * 100,
    }, (err, stdout, stderr) => {
      // err is only set if process spawn failed (not nonzero exit code)
      resolve({ code: (err && err.code != null ? err.code : (proc.exitCode || 0)), stdout, stderr });
    });
    if (input !== null) {
      proc.stdin.write(input);
      proc.stdin.end();
    }
  });
}

function makeTempFile(contents) {
  const tmpDir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-clitest-'));
  const filePath = path.join(tmpDir, 'in.txt');
  fs.writeFileSync(filePath, contents, { encoding: 'utf8' });
  return { filePath, tmpDir };
}

test('prints usage and exits with 0 for --help', async () => {
  const res = await runCLI(['--help']);
  assert.match(res.stdout, /Usage:/);
  assert.strictEqual(res.code, 0);
});

test('exits with 1 and prints error for missing <search_query>', async () => {
  const res = await runCLI([]);
  assert.match(res.stderr, /Missing <search_query>/);
  assert.strictEqual(res.code, 1);
});

test('handles empty input file (prints No data found., exit 0)', async () => {
  const { filePath, tmpDir } = makeTempFile('');
  try {
    const res = await runCLI(['foo', filePath]);
    assert.match(res.stdout, /No data found/);
    assert.strictEqual(res.code, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('handles no matches (prints No matches found, exit 0)', async () => {
  const { filePath, tmpDir } = makeTempFile('alpha\nbeta\ngamma\n');
  try {
    const res = await runCLI(['nomatch', filePath]);
    assert.match(res.stdout, /No matches found/);
    assert.strictEqual(res.code, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('invalid input file path: friendly error, exit code 1', async () => {
  const res = await runCLI(['foo', '/not/there/file.txt']);
  assert.match(res.stderr, /not found|Failed to read input/i);
  assert.strictEqual(res.code, 1);
});

test('malformed JSON lines: skip bad lines and warn, but parse valid ones', async () => {
  const lines = '{"x":1}\nnotjson\n{"x":2}\n{"invalid":\n{"x":3}\n';
  const { filePath, tmpDir } = makeTempFile(lines);
  try {
    const res = await runCLI(['foo', '--unique-by', 'x', filePath]);
    // Skips invalid, returns matching valid objects -- in this test, none match 'foo' in 'x', so "No matches"
    assert.match(res.stdout, /No matches found/);
    // Error output should mention skipping line
    assert.match(res.stderr, /Skipping line 2/i);
    assert.match(res.stderr, /Skipping line 4|Unexpected/i);
    assert.strictEqual(res.code, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('invalid regex pattern: prints regex error and exit code 1', async () => {
  const { filePath, tmpDir } = makeTempFile('foo\nbar\nbaz\n');
  try {
    const res = await runCLI(['[', filePath, '--regex']);
    // Should print error about invalid regex
    assert.match(res.stderr, /Regex error: Invalid regular expression pattern/i);
    assert.strictEqual(res.code, 1);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('missing uniqueness key field: objects missing key are skipped, warning to stderr', async () => {
  const lines = '{"id": 1, "msg": "foo"}\n{"msg": "missing id"}\n{"id":2, "msg": "bar"}\n{"msg": "no id here"}\n{"id":1, "msg": "dup"}\n';
  const { filePath, tmpDir } = makeTempFile(lines);
  try {
    const res = await runCLI(['foo', '--unique-by', 'id', filePath]);
    // Will warn about missing key in skipped lines, but process
    assert.match(res.stderr, /Warning: Skipping object missing key 'id'/);
    // Output matches only lines with id key
    assert.match(res.stdout, /foo/);
    // Only unique id lines kept, first matching id=1 line should print
    assert.match(res.stdout, /\{.*id.*1.*foo/);
    assert.strictEqual(res.code, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('stdin fallback: no file, non-tty stdin with lines', async () => {
  // Simulate by piping input
  const bin = path.join(process.cwd(), 'bin/unique-search');
  let child, got;
  await new Promise((res) => {
    child = execFile('node', [bin, 'error'], {}, (err, stdout, stderr) => {
      got = { stdout, stderr, code: (err && err.code != null ? err.code : (child.exitCode || 0)) };
      res();
    });
    child.stdin.write('foo\nbar\nerr\nerrorline\n\n');
    child.stdin.end();
  });
  assert.match(got.stdout, /errorline/);
  assert.strictEqual(got.code, 0);
});

test('empty stdin (no input): prints No data found', async () => {
  const bin = path.join(process.cwd(), 'bin/unique-search');
  let child, got;
  await new Promise((res) => {
    child = execFile('node', [bin, 'foo'], {}, (err, stdout, stderr) => {
      got = { stdout, stderr, code: (err && err.code != null ? err.code : (child.exitCode || 0)) };
      res();
    });
    child.stdin.end(); // no data
  });
  assert.match(got.stdout, /No data found/);
  assert.strictEqual(got.code, 0);
});
