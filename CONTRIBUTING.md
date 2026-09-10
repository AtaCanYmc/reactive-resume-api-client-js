# Contributing to reactive-resume-api-client-js

Thank you for your interest in contributing to `reactive-resume-api-client-js`! This document outlines our development workflow, engineering standards, and guidelines for submitting contributions.

---

## Code of Conduct

All contributors and maintainers are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it to understand the behavioral standards of our community.

---

## Core Engineering Principles

Before contributing code, please keep these strict architectural commitments in mind:

1. **Zero Runtime Dependencies:**
   This SDK is built exclusively on modern web standards (`fetch`, `AbortSignal.timeout`, `Uint8Array`, `JSON`). **Never add external runtime dependencies** to `dependencies` in `package.json`. Everything must run natively across Node.js, Bun, Deno, Edge runtimes, and browsers.

2. **Isomorphic Compatibility:**
   Code must execute without modification in both Node.js (20+) and browser/edge environments. Avoid Node-only modules (like `node:fs` or `node:path`) in `src/`.

3. **Strict Typing:**
   All exported APIs, request options, response bodies, and errors must provide comprehensive TypeScript type definitions. Ensure `npm run typecheck` passes with zero errors.

4. **Conventional Commits:**
   Our release pipeline ([Release Please](https://github.com/googleapis/release-please)) relies on Conventional Commits to calculate semver version bumps and generate changelogs. PR titles and commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

---

## Local Development Setup

### Prerequisites

- **Node.js**: `>= 20.12.0` (LTS recommended)
- **npm**: `>= 10.0.0`

### 1. Clone the Repository

```bash
git clone https://github.com/AtaCanYmc/reactive-resume-api-client-js.git
cd reactive-resume-api-client-js
```

### 2. Install Dependencies

```bash
npm install
# or: make install
```

### 3. Verify Local Setup

Run the full verification suite (typecheck + test + build):

```bash
npm run typecheck
npm test
npm run build
# or simply: make check
```

---

## Makefile Cheatsheet

A developer [`Makefile`](Makefile) is provided for convenience:

| Command | Action |
| :--- | :--- |
| `make check` | Run typecheck, unit tests, and build |
| `make test` | Run unit tests with Vitest |
| `make test-watch` | Run tests in interactive watch mode |
| `make test-cov` | Run tests with coverage reporting |
| `make typecheck` | Run `tsc --noEmit` |
| `make build` | Build ESM & CJS distribution bundles via `tsup` |
| `make demo` | Build SDK and start the interactive web demo server |
| `make clean` | Remove `dist/`, coverage, and temporary artifacts |

---

## Writing Tests

We use [Vitest](https://vitest.dev/) for unit testing. All new endpoints, methods, and bug fixes must include corresponding tests in the `tests/` directory.

- Tests should mock `fetch` or use mock responses rather than calling live servers.
- Ensure all 32+ existing tests continue to pass:
  ```bash
  npm test
  ```

---

## Interactive Web Demo

The repository contains an interactive dashboard under `demo/web/`. If you introduce changes to public client methods or types, make sure the demo continues to build and run:

```bash
npm run build:demo
npm run preview:demo
# or: make demo
```

---

## Pull Request Guidelines

1. **Create a Topic Branch:**
   ```bash
   git checkout -b feat/add-export-formats
   # or: git checkout -b fix/auth-header-casing
   ```

2. **Follow Conventional Commits:**
   PR titles and commits must use standard prefixes:
   - `feat:` — A new feature or endpoint method
   - `fix:` — A bug fix
   - `docs:` — Documentation changes only
   - `test:` — Adding or updating unit tests
   - `refactor:` — Code changes that neither fix a bug nor add a feature
   - `perf:` — Performance improvements
   - `build:` — Build system or dependency updates
   - `ci:` — CI/CD workflow changes
   - `chore:` — Miscellaneous maintenance tasks

3. **Verify Everything Passes:**
   ```bash
   make check
   ```

4. **Submit Your PR:**
   - Fill in the PR description template detailing the motivation and changes.
   - Wait for CI checks (Node 20, 22, 24 matrix, PR title validator) to complete.
   - Maintainers will review your PR and provide feedback.
