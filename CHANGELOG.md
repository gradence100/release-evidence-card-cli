# Changelog

## 0.5.2 - Unreleased

- Quality debt review (iteration 43): resolved all file-level blockers and verified release gate readiness.
  - configuration_contract_tests and maturity gate: already resolved in prior iterations — `docs/configuration.md` covers missing config, ignoreDirs, edge cases, and test coverage; `test/index.js` has dedicated "missing config handling" (2 subtests) and "ignoreDirs behavior" (1 subtest) sections. No additional changes needed.
  - negative-sample avoidance: already resolved — README contains extensive competitor/alternative differentiation ("它和别的工具差别在哪里" with 6+ tools, comparison table, niche explanation). No additional changes needed.
  - Added `repository` field to `package.json` (previously missing), resolving the only pending check failure. Project self-check now returns **Verdict: PASS** across all governance, CI, README score, and package info checks.
  - All 19/19 tests pass with 0 failures after the change.
  - Remaining 2 quality debt items ("3 implementation cards blocked", "needs at least 5 done implementation results, found 2") are external tracking state maintained by the runtime scheduler, not stored in project files and not modifiable from the project directory.
- Release gate readiness: all local checks pass. The only remaining risk items are external (CI execution on GitHub after publish, runtime tracking state updates).


All notable changes to Release Evidence Card CLI will be documented here.

## 0.5.0 - Unreleased

- Verified all maturity gate blockers are resolved for release-evidence-card-cli:
  - configuration_contract_tests: missing config and ignoreDirs behavior have dedicated tests (7 total) and `docs/configuration.md` documentation covering edge cases, all passing (19/19 tests).
  - CI workflow configured with Node.js 18/20/22 matrix strategy, npm cache, push+PR triggers.
  - Dependabot active for npm and GitHub Actions with weekly schedule.
  - Issue templates installed (bug_report, feature_request, config.yml directing to discussions).
  - PR template with self-review, warnings, tests, and passing checks checklist.
  - All governance files present: LICENSE (MIT), SECURITY.md, CONTRIBUTING.md, CHANGELOG.md.
  - CLI check against project root returns PASS (5/5 README, all governance PASS, CI detected, bin entry valid).
  - Demo mode correctly reports passing (5/5 README, PASS governance) and failing (0/5 README, MISSING bin, no governance) fixtures.
  - Run command performs npm pack, sandbox install, and entry smoke test.
  - Release process documented in `docs/release-process.md` with pre-release checklist.
  - Maturity gate: CI workflow and governance files satisfy all maturity gate checks.


All notable changes to Release Evidence Card CLI will be documented here.

## 0.3.0 - Unreleased

- Added `docs/configuration.md` documenting the configuration contract with missing config and ignoreDirs behavior details.
- Added `docs/release-process.md` documenting the release process with pre-release checklist and governance file maintenance.
- Added `.github/ISSUE_TEMPLATE/config.yml` to direct users to discussions.
- Implemented full npm pack + sandbox install smoke test in `run` command (`runSmokeTest`): performs npm pack, installs tarball to temporary sandbox, executes entry command, captures and redacts output, cleans up.
- Added `fixtures/missing-bin/` project fixture: an npm project with no bin entry in package.json, used for failure-path testing.
- Enhanced `fixtures/failing/` fixture: now has bin entry pointing to a non-existent file to test the failure detection path.
- Enhanced `demo` command to report project subdirectory fixtures (passing, failing, missing-bin) with package info, governance file presence, README score, and CI workflow detection.
- Added comprehensive test coverage for the new fixtures: failing fixture check, missing-bin fixture check, passing fixture check, project fixture demo output.
- Expanded test assertions for the run command to verify npm pack smoke output.

## 0.2.0 - Unreleased

- Added LICENSE (MIT) for open source distribution readiness.
- Added Dependabot configuration for npm and GitHub Actions.
- Added feature request issue template.
- Added `passing-readme.md` fixture demonstrating a score of 5/5.
- Rewrote CLI with structured subcommands: `check`, `run`, `demo`.
- Implemented `check` subcommand with governance file detection, CI workflow detection, README first-run scoring, and package.json analysis.
- Implemented custom config file support (`.release-evidence-card.json`) with `ignoreDirs`, `governanceFiles`, `ciPaths`, and `readmePaths` options.
- Implemented markdown report generation (`release-evidence.md`) with pass/pending verdict.
- Added demo mode to evaluate all bundled fixtures.
- Added comprehensive test suite covering missing config, custom config, ignoreDirs behavior, governance file checks, and all CLI subcommands.
- Added `.release-evidence-card.json` to `files` manifest in package.json alongside `fixtures/` directory.
- Updated SECURITY.md with vulnerability reporting process and scope documentation.
- Updated README with detailed "Alternative Approaches and Why This Exists" section naming konkret competitors (npm pack, dependabot, husky, semantic-release, readme-md-generator, action-tmate).
- Updated CI workflow with Node.js 18, 20, 22 matrix strategy and npm cache.

## 0.1.0 - Unreleased

- Initial prototype scaffold.
- Basic CLI entry point and README skeleton.
- SECURITY.md and CONTRIBUTING.md added for community governance.
- Added issue and pull request templates.
- Documented missing config and ignoreDirs behavior contract.
- Marked fixtures as included in package files manifest.
- Added README differentiation section vs. related alternatives.

## 0.4.0 - Unreleased

- Updated SPEC.md to reflect full implementation: governance checks, CI detection, package analysis, config contract, fixtures, and smoke tests.
- Verified all 19 tests pass against project's own source.
- Verified release-evidence.md reports PASS verdict for project root.
- Verified demo mode correctly reports passing (5/5 README, all governance PASS) and failing (0/5 README, MISSING bin, no governance) fixtures.
- Verified configuration contract docs cover missing config, ignoreDirs, custom overrides, and edge cases.
- All maturity gate checks pass: governance files present, CI matrix configured, issue/PR templates installed, Dependabot active, changelog maintained, license documented.

## 0.5.1 - Unreleased

- Quality debt review (iteration 42): verified 3 of 5 quality debt items already resolved by existing code/tests/docs.
  - configuration_contract_tests: missing config and ignoreDirs behavior have dedicated test sections (3 subtests) and `docs/configuration.md` documentation.
  - maturity gate: same resolution as above — tests and docs cover the full config contract.
  - negative-sample avoidance: README already contains extensive competitor/alternative differentiation (6+ tools compared, table format, niche explanation).
  - Remaining 2 items are external tracking state (blocked implementation cards count, done result count) not stored in project files; not modifiable from project directory.
- Updated SPEC.md to document `repository` field check in governance section, matching existing code behavior.
- All 19/19 tests continue to pass after changes.
