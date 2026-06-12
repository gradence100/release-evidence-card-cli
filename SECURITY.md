# Security Policy

This project is a local-only development utility for generating release evidence cards. It does not perform network calls, write to external services, or execute untrusted code from the filesystem beyond the target project's declared entry point.

## Supported Versions

Only the latest minor release on the main branch is actively supported for security patches. Pre-releases may receive security fixes on a best-effort basis.

## Reporting a Vulnerability

If you find a security issue:

1. Do not open a public issue immediately.
2. Describe the problem clearly, including steps to reproduce, affected versions, and potential impact.
3. Send your report to the project maintainers by opening a draft security advisory on GitHub or contacting the repository owner directly.

We will acknowledge your report within 3 business days, provide an initial assessment, and coordinate a fix disclosure timeline with you.

## Scope

- The tool reads local files only and writes reports to the local filesystem.
- No network egress occurs during normal operation.
- The `run` command accepts an entry command argument; in v0 this is stubbed and does not execute arbitrary shell commands against the host.
