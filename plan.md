# Build plan

## Incremental Build Milestones

1. Setup project structure, package.json, README, .gitignore, and basic CLI scaffold with help message and version.
2. Implement input reading module supporting file or stdin, reading line-by-line text input.
3. Implement basic search: case-sensitive exact string match on lines, output matched lines.
4. Add output formatting with clean matched line printing and no-match or empty input messages.
5. Add uniqueness filtering module that deduplicates items before search.
6. Add search options: case-insensitive matching and regex matching with error handling.
7. Extend to support structured JSON lines input with "--unique-by <field>" option for uniqueness and search.
8. Implement comprehensive error and edge case handling and add tests covering all modules and integration.
9. Finalize README with usage examples, CLI options explanation, and add LICENSE.
10. Add deployment configuration files to run on Railway (backend only).

