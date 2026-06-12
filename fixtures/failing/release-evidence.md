# Release Evidence Card

**Target directory:** `fixtures/failing`
**Generated:** 2026-06-12

## Package Info

- Name: failing-cli
- Bin entry: MISSING
- Node engine constraint: YES

## Governance Files

- FAIL: LICENSE
- FAIL: SECURITY.md
- FAIL: CONTRIBUTING.md
- FAIL: CHANGELOG.md

## CI

- CI workflow: FAIL (missing)
- CI config: Node.js 18, 20, 22 matrix

## README First-Run Score

- File: fixtures/failing/README.md
- Score: 0/5
- MISSING: target user
- MISSING: install command
- MISSING: first run command
- MISSING: expected output
- MISSING: license mention

## Configuration

- ignoreDirs: node_modules, .git, .github
- Custom config: NO (using defaults)

## Verdict: PENDING

### Items to fix before release:
- Add `LICENSE` to project root
- Add `SECURITY.md` to project root
- Add `CONTRIBUTING.md` to project root
- Add `CHANGELOG.md` to project root
- Add CI workflow at `.github/workflows/ci.yml`
- Improve README: add target user, install command, and first-run example
- Add bin entry to package.json