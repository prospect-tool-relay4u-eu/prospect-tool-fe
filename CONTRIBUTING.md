# Contributing

Thanks for contributing to `prospect-tool-fe`, the Angular frontend for the EU Relay 4U prospecting tool.

## Prerequisites

- Node **24** (matches CI — use `nvm`/`fnm`/similar to match this version)
- npm — the repo pins `npm@11.17.0` via the `packageManager` field in `package.json`; use `corepack` or install that version to stay consistent

## Getting started

```bash
git clone git@github.com:prospect-tool-relay4u-eu/prospect-tool-fe.git
cd prospect-tool-fe
npm ci
npm start
```

The dev server runs at `http://localhost:4200` and expects the backend at `http://localhost:8080` (see `src/environments/environment.ts`).

## Running tests

```bash
npm test
```

Runs unit tests via Vitest (Angular's `@angular/build:unit-test` builder).

## Branching & pull requests

- `develop` is the default branch and the integration branch for all contributions — branch off `develop`, open your PR targeting `develop`
- `main` is the stable/release branch: maintainers periodically open a `develop` → `main` PR to cut a release; pushes to `main` deploy to staging, and version tags (`v*.*.*`) deploy to production
- Both `develop` and `main` are protected: a pull request and a passing CI run are required before merging — direct pushes aren't allowed
- CI (`.github/workflows/ci.yml`) runs on every PR into `develop` or `main`: `npm ci`, `npm run lint`, `npm test -- --watch=false`, `npm run build`

## Commit messages

Keep commits short and imperative, prefixed with the type of change, e.g.:

```
fix: correct token refresh timing in auth interceptor
feat: add bulk record delete confirmation dialog
change: rename ProjectTable column header component
```

## Code style

- Formatting is enforced by **Prettier** (`printWidth: 100`, single quotes; HTML files use the `angular` parser) — run your editor's Prettier integration or `npx prettier --write .` before committing
- Linting is enforced by **ESLint** via `@angular-eslint` (`npm run lint`), including template accessibility rules (keyboard handlers on interactive elements, labels associated with form controls, etc.) — run it before opening a PR
- `.editorconfig` enforces 2-space indentation and trims trailing whitespace
- Use **standalone components** — this project does not use NgModules
- Prefer **signals** for local component/service state; use RxJS for async streams and bridge to signals with `toSignal`/`takeUntilDestroyed` where appropriate
- Follow the existing folder split: shared/cross-cutting code (guards, interceptors, models, services) goes in `src/app/core/`; page-level functionality goes in `src/app/features/<feature-name>/`

## Docker

```bash
docker build --build-arg BUILD_CONFIG=production -t prospect-tool-fe .
docker run -p 8080:80 prospect-tool-fe
```

## License

This project is licensed under the [MIT License](LICENSE).
