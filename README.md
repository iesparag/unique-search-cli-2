# unique-search-cli-2

> A unique command-line search utility with robust uniqueness filtering and flexible options.

## Features
- Search input data from files or stdin
- Uniqueness filtering (by line, or by field for structured JSON)
- Flexible matching (case-sensitivity, regex support)
- Comprehensive error & edge case handling
- Zero-dependency Node.js CLI, fully tested

## Installation

Clone the repository and link:

```sh
git clone https://github.com/iesparag/unique-search-cli-2.git
cd unique-search-cli-2
npm install
# Link globally for CLI usage
npm link
```

## Usage

```sh
unique-search [options] <search_query> [input_file]
```

### Options

- `--help`                Show usage information and exit
- `--version`             Print the tool version and exit
- `--ignore-case`         Case-insensitive search (default)
- `--case-sensitive`      Case-sensitive search
- `--regex`               Use search_query as regular expression
- `--unique-by <field>`   For JSON line inputs: match and deduplicate by a field

### Examples

Search unique lines in a text file for "error":

```sh
unique-search "error" logfile.txt
```

Case-sensitive search:
```sh
unique-search --case-sensitive "fooBar" mydata.txt
```

Use regex:
```sh
unique-search --regex 'Erro?r:.*' logfile.txt
```

Read from stdin:
```sh
cat mydata.txt | unique-search "hello"
```

Search unique JSON objects by key "id":
```sh
unique-search --unique-by id "1234" data.jsonl
```

### Output
- Matching lines or objects are printed, newline-separated.
- If no match: prints `No matches found.` and exits 0.
- If input is empty: prints `No data found.` and exits 0.
- All errors print to stderr, with clear messages (see below).

## Error Handling & Troubleshooting

This CLI is robust against common issues. Here are its responses:

| Problem                                 | Output (stderr/stdout)                 | Exit Code |
|------------------------------------------|-----------------------------------------|-----------|
| **No input provided**                    | No data found. (stdout)                 | 0         |
| **Empty input file / empty stdin**       | No data found. (stdout)                 | 0         |
| **No matches found**                     | No matches found. (stdout)              | 0         |
| **Input file not found**                 | Error: Input file not found... (stderr) | 1         |
| **Malformed JSON lines**                 | Skipping line #: ... (stderr), continues| 0         |
| **Invalid regex pattern**                | Regex error: Invalid ... (stderr)       | 1         |
| **Missing uniqueness key in object**     | Warning: Skipping ... (stderr)          | 0         |
| **Missing <search_query>**               | Error: Missing <search_query> (stderr)  | 1         |

#### Example: Malformed JSON
```
$ unique-search --unique-by id "foo" bad.jsonl
Skipping line 2: Unexpected token ...
Skipping line 4: Not a JSON object
No matches found.
```

#### Example: Invalid regex
```
$ unique-search --regex '[' input.txt
Regex error: Invalid regular expression pattern: Unterminated character class
```

#### Example: Missing Key
```
$ unique-search --unique-by id foo input.jsonl
Warning: Skipping object missing key 'id' at line 3
{"id":1,"msg":"foo"}
```

## Exit Codes
- `0`: Success (matches or no matches, or controlled edge cases)
- `1`: Error (fatal parsing, I/O, invalid arguments or patterns)

## Testing

Run all tests with:

```sh
npm test
```

## Deployment

There is **no web UI**. This is a CLI-only project.

### Railway (backend / CLI deployment)

Use the button below to deploy on [Railway](https://railway.app/) and run CLI jobs via Railway's shell:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

- Select this repo: https://github.com/iesparag/unique-search-cli-2
- Set `backend/` as project root (or repo root for CLI)
- No environment variables required

---

## License

MIT. See [LICENSE](LICENSE).
