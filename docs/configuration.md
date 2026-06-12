# Configuration Contract

The Release Evidence Card CLI reads an optional `.release-evidence-card.json` configuration file from the target directory. If no config file is found, sensible defaults are used.

## Default Configuration

```json
{
  "ignoreDirs": ["node_modules", ".git", ".github"],
  "governanceFiles": ["LICENSE", "SECURITY.md", "CONTRIBUTING.md", "CHANGELOG.md"],
  "ciPaths": [".github/workflows/ci.yml", ".github/workflows/ci.yaml"],
  "readmePaths": ["README.md", "README.rst"]
}
```

## Fields

### ignoreDirs (string[])

Directories excluded from file scanning. The default skips `node_modules`, `.git`, and `.github` to avoid checking external or generated files.

**Missing config behavior**: When no `.release-evidence-card.json` exists, the tool uses the default `ignoreDirs` list. This is tested in the test suite under "ignoreDirs behavior".

**Example override** to skip additional directories:
```json
{
  "ignoreDirs": ["node_modules", ".git", "dist", "coverage", "tmp"]
}
```

### governanceFiles (string[])

Files that must exist at the project root for a passing governance score. Each is checked via `fs.existsSync`.

### ciPaths (string[])

Relative paths to CI workflow files. The tool checks if at least one exists.

### readmePaths (string[])

Relative paths to README files. The first found file is scored against five criteria: target user mention, install command, first-run command, expected output, and license mention.

## Edge Cases

- **Malformed config**: If `.release-evidence-card.json` contains invalid JSON, the tool silently falls back to defaults.
- **Partial config**: User-supplied fields are merged into defaults; unspecified fields keep default values.
- **No config file**: All defaults apply, and the report line reads "NO (using defaults)".

## Expected Report Lines

These lines are the contract release reviewers can look for when checking the README, tests, or generated evidence card.

### No `.release-evidence-card.json`

```text
## Configuration
- ignoreDirs: node_modules, .git, .github
- Custom config: NO (using defaults)
```

This means the CLI did not require setup before first value. It used the built-in default config and continued with package, governance, CI, and README checks.

### Custom `ignoreDirs`

Config:

```json
{
  "ignoreDirs": ["node_modules", ".git", "dist", "coverage"]
}
```

Expected evidence card line:

```text
- ignoreDirs: node_modules, .git, dist, coverage
- Custom config: YES
```

The current CLI reports configured directories in the evidence card so reviewers can see whether generated or vendored folders were intentionally excluded. The README scanner only reads files from `readmePaths`; by default that means a `node_modules/README.md` does not replace the project root README.

## Fixture Proof

The bundled fixtures keep the configuration behavior visible without external services:

- `fixtures/passing` shows a release-ready npm CLI shape with governance files, README evidence, and package metadata.
- `fixtures/failing` keeps a negative sample with no governance files and weak README evidence, so demo output shows concrete release gaps rather than marketing claims.
- Temporary test fixtures created by `node --test test/` verify missing config, custom governance files, and default `ignoreDirs` behavior.

## Test Coverage

- `test/index.js` includes:
  - "missing config handling" - verifies default behavior when no config file exists
  - "ignoreDirs behavior" - verifies that `node_modules` contents are excluded by default
  - "governance file checks" - verifies both present and missing governance files
  - "custom config file" - verifies that a `.release-evidence-card.json` overrides defaults
