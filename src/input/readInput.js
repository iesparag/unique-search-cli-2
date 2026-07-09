// src/input/readInput.js
import fs from 'node:fs';
import readline from 'node:readline';

/**
 * Efficiently read lines (plain or JSON) from a file or stdin (UTF-8).
 * If options.jsonLines is true, parse each line as JSON;
 *   upon parse error, print warning to stderr with line number and skip line.
 * If filePath is not provided, reads from process.stdin.
 *
 * @param {string|undefined} filePath 
 * @param {object} [options] { jsonLines?: boolean }
 * @returns {Promise<string[]|object[]>} Array of lines (string) or JSON objects.
 * @throws on file-not-found or I/O errors (not on parse errors).
 */
export async function readInput(filePath, options = {}) {
  const { jsonLines = false } = options;
  const items = [];
  let inputStream, closeStream = null;

  try {
    if (filePath) {
      // Check file existence for friendly error
      await fs.promises.access(filePath, fs.constants.R_OK);
      inputStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      closeStream = () => {
        inputStream.close();
      };
    } else {
      // Reading from stdin
      // Treat as non-tty unless explicitly TTY
      if (process.stdin.isTTY) {
        throw new Error('No input file provided and no data piped via stdin.');
      }
      inputStream = process.stdin;
    }

    const rl = readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    let lineIdx = 0;
    let readOne = false;
    for await (const line of rl) {
      lineIdx++;
      readOne = true;
      if (!jsonLines) {
        if (line !== undefined && line !== null) {
          items.push(line);
        }
        continue;
      }
      // Parse as JSON (skip empty lines)
      if (line.trim() === '') continue;
      try {
        let obj = JSON.parse(line);
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
          process.stderr.write(`Skipping line ${lineIdx}: Not a JSON object\n`);
          continue;
        }
        items.push(obj);
      } catch (err) {
        process.stderr.write(`Skipping line ${lineIdx}: ${err.message}\n`);
      }
    }
    // Special: if input file is empty (0 bytes) or stdin has no lines, items is empty
    if (filePath && closeStream) {
      closeStream();
    }
    if (!readOne && !filePath) {
      // stdin but no lines at all: treat as no input
      return [];
    }
    return items;
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Input file not found: ${filePath}`);
    }
    throw new Error(`Failed to read input: ${err.message}`);
  }
}
