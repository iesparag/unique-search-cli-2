// src/input/readInput.js
import fs from 'node:fs';
import readline from 'node:readline';

/**
 * Efficiently read lines from a file or stdin (UTF-8), returns array of strings.
 * If filePath is not provided, reads from process.stdin.
 *
 * @param {string | undefined} filePath
 * @returns {Promise<string[]>}
 * @throws on file-not-found or other I/O errors.
 */
export async function readInput(filePath) {
  const lines = [];
  let inputStream, closeStream = null;

  try {
    if (filePath) {
      // Check file existence separately to provide friendly error
      await fs.promises.access(filePath, fs.constants.R_OK);
      inputStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      closeStream = () => {
        inputStream.close();
      };
    } else {
      // Reading from stdin
      if (process.stdin.isTTY) {
        // No file and nothing piped in: provide helpful message
        throw new Error('No input file provided and no data piped via stdin.');
      }
      inputStream = process.stdin;
      // stdin is not closed by us
    }

    const rl = readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      lines.push(line);
    }

    if (filePath && closeStream) {
      closeStream();
    }

    return lines;
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Input file not found: ${filePath}`);
    }
    throw new Error(`Failed to read input: ${err.message}`);
  }
}
