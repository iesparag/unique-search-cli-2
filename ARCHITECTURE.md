# Architecture

## Components

- CLI parser module: Parses command-line options and arguments using built-in Node.js 'process.argv' with custom logic.
- Input module: Reads input from a file or stdin, supports plain text or JSON lines.
- Processing module: Filters data to unique items by content or by a specified key field (for JSON objects).
- Search module: Matches user query string or regex against unique items with case sensitivity support.
- Output module: Prints matching items or messages to stdout/stderr.

## Folder Structure

```
unique-search-cli/
  bin/                 # CLI entrypoint executable script
  src/
    cli/               # argument parsing
    input/             # loading raw data
    processing/        # uniqueness filtering
    search/            # search logic
    output/            # printing results
  tests/               # unit and integration tests
  README.md
  LICENSE
  .gitignore
  package.json
  .env.example
```

## Data Flow

1. CLI module parses command line arguments.
2. Input module loads raw lines or JSON objects from file or stdin.
3. Processing module deduplicates data according to options.
4. Search module runs the user query (plain or regex) with matching options.
5. Output module displays matched unique items or messages.

## Key Decisions

- Use Node.js with ES modules for widespread availability and ease of scripting.
- No third-party dependencies; use built-in Node.js APIs and 'node:test' for testing.
- Support both plain text line input and JSON line input with --unique-by option.
- Limit processing to line-by-line streaming to handle large inputs efficiently.
- Graceful error messages for invalid input, invalid regex, missing files, or empty data.
- Small simple CLI command interface with detailed help.

