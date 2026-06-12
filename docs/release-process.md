# Release Process

This document describes the release process for Release Evidence Card CLI itself.

## Pre-Release Checklist

Before tagging a release, run the release evidence tool against its own source:

```bash
node src/index.js check
```

The report must show PASS for:
- Package info (bin entry present, engines declared)
- All governance files (LICENSE, SECURITY.md, CONTRIBUTING.md, CHANGELOG.md)
- CI workflow detected
- README first-run score at 4/5 or higher

## Steps

1. Update `CHANGELOG.md` with the new version and changes.
2. Bump version in `package.json`.
3. Run `node --test test/` and confirm all tests pass.
4. Run `node src/index.js check` against the project root to generate release evidence.
5. Review the generated `release-evidence.md`.
6. Tag the commit: `git tag v<version> -m "Release v<version>"`
7. Push tag: `git push origin v<version>`

## Post-Release

- Publish to npm: `npm publish` (requires npm login and `private: false` in package.json)
- Create a GitHub Release with release notes copied from CHANGELOG.md
- Attach the generated `release-evidence.md` as evidence

## Governance File Maintenance

- `LICENSE`: MIT, updated only if project licensing changes.
- `SECURITY.md`: Review yearly; update supported versions and contact info.
- `CONTRIBUTING.md`: Update if the contribution flow changes.
- `CHANGELOG.md`: Append after each release; never edit past entries.
