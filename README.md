# unique-search-cli-2

> A unique command-line search utility with robust uniqueness filtering and flexible options.

## Features
- Search input data from files or stdin
- Uniqueness filtering (by line, or future: by field for structured JSON)
- Flexible matching (future: case sensitivity, regex support)
- Simple, zero-dependency Node.js CLI

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

- `--help`      Show usage information.
- `--version`   Print the tool version.

Example:

```sh
unique-search "error" logfile.txt
```

Or read from stdin:

```sh
cat logfile.txt | unique-search "error"
```

More advanced options (uniqueness by key, regex, etc) will come in future releases.

## Development

- All source code is in `src/`
- Entrypoint: `bin/unique-search`
- Tests: `npm test`

## License

MIT. See [LICENSE](LICENSE).
