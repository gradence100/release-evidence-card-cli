# Contributing Guide

First, thank you for considering contributing to this project. It is a small local utility for npm CLI maintainers to build trustworthy release evidence before asking users to install their work.

## What We Accept

- Clear bug reports with reproduction steps.
- Documentation improvements that make the 5-minute demo path easier to follow.
- Test cases that improve coverage for missing configuration, missing files, and ignoreDirs behavior.
- Safe, targeted extensions that stay inside the v0 scope: no network calls, no external GitHub writes, no language-specific adapters outside the npm/Node.js CLI world.

## What We Keep Out For v0

- Adding full CI orchestration layers outside the local CLI.
- Adding built-in publishing or GitHub integration.
- Porting the tool to other languages (Python, Rust, Go) before the npm path proves useful.
- Heavy visual dashboards that break the under-5-minute local-first promise.

## Local Development Flow

1. Clone the repo.
2. Run `node src/index.js` to verify the entry point boots without errors.
3. Test against a real npm CLI fixture inside the repo before opening a change.
4. Keep changes small and explain which concrete user pain they address.

## Before You Submit

- Confirm you have not introduced implicit network calls.
- Confirm new behavior is either documented or covered by a test case.
- Confirm you have not extended the tool's safety boundary to allow external writes.
