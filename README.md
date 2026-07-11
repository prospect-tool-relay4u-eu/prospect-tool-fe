# EU Relay 4U — Prospecting Frontend

Angular frontend for the EU Relay 4U prospecting tool — a schema-less prospecting/lead-tracking application.

## Overview

Users register, verify their email with a 6-digit code, and log in to create **Projects**. Each project has user-defined **Fields** (like flexible spreadsheet columns — string, boolean, integer, or number), which are filled in as **Records** in an inline-editable data grid. This app talks to **two** backends: [`relay4u-auth-service-be`](https://github.com/prospect-tool-relay4u-eu/relay4u-auth-service-be) for authentication, and [`eu-relay-4u-prospecting-be`](https://github.com/prospect-tool-relay4u-eu/prospect-tool-be) for all project/record business logic. See [`documentation/`](documentation/README.md) for the detailed flow.

## Tech stack

- **Angular 22** — standalone components (no NgModules), esbuild-based `@angular/build` builders
- **TypeScript** ~6.0, **RxJS** ~7.8, native Angular **signals** for state (no NgRx)
- **Vitest** (+ jsdom) for unit tests via Angular's `@angular/build:unit-test` builder
- **npm** (pinned to `npm@11.17.0` via the `packageManager` field), **Prettier** for formatting
- No UI component library (no Material/PrimeNG/Tailwind) — hand-written CSS design system
- **Docker** (nginx-served static build) deployed to **GCP Cloud Run**

## Application structure

| Path | Responsibility |
|---|---|
| `core/guards` | Route guards (`authGuard` protects `/projects*`) |
| `core/interceptors` | HTTP interceptors: attach JWT, handle 401 → logout |
| `core/models` | Shared TypeScript models (e.g. `project.model.ts` — field types, slug helper) |
| `core/services` | `AuthService`, `ProjectService`, `RecordService`, `ThemeService` |
| `features/auth` | Login, register, verify-email pages |
| `features/landing` | Public landing page |
| `features/dashboard` | Redirects to `/projects` |
| `features/projects` | Project list, project settings (fields), project table (records grid) |
| `features/shared` | Shared feature UI (e.g. navbar) |
| `shared/directives` | Cross-cutting directives |

## Routes

| Path | Component | Access | Purpose |
|---|---|---|---|
| `/` | Landing | Public | Marketing/landing page |
| `/login` | Login | Public | Sign in |
| `/register` | Register | Public | Create an account |
| `/verify-email` | VerifyEmail | Public | Enter the 6-digit email verification code |
| `/projects` | ProjectsList | Guarded | List the current user's projects |
| `/projects/:id` | ProjectTable | Guarded | Spreadsheet-style view/edit of a project's records |
| `/projects/:id/settings` | ProjectSettings | Guarded | Manage project name/description and field definitions |
| `/dashboard` | — | Guarded | Redirects to `/projects` |
| `**` | — | Public | Redirects to `/` |

All routes are lazy-loaded standalone components via `loadComponent`.

## Auth flow

- On login/register, the backend-issued JWT is stored in **`sessionStorage`** (key `r4u-token`).
- `authInterceptor` attaches `Authorization: Bearer <token>` to every outgoing HTTP request.
- `httpErrorInterceptor` catches `401` responses (except calls to `/api/auth/*`) and forces `AuthService.logout()`.
- `authGuard` blocks `/projects*` routes for unauthenticated users, redirecting to `/login`.
- `AuthService` decodes the JWT payload client-side to display the logged-in user's name — this is not a trust boundary; all real authorization happens on the backend.

## API integration

Requests are split across **two** backend base URLs:

| Service | Base URL | Backend endpoints |
|---|---|---|
| `AuthService` | `environment.authApiBase` (auth service) | `POST /auth/login`, `/auth/register`, `/auth/verify-email`, `/auth/resend-verification` |
| `ProjectService` | `environment.apiBase` (prospecting backend) | `GET/POST /projects`, `GET/PUT/DELETE /projects/{id}`, `POST/DELETE /projects/{id}/fields[/{fieldId}]`, `PUT /projects/{id}/fields/order` |
| `RecordService` | `environment.apiBase` (prospecting backend) | `GET/POST /projects/{id}/records`, `DELETE /projects/{id}/records` (bulk), `PUT/DELETE /records/{id}` |
| `ThemeService` | – | No backend calls — client-side light/dark theme, persisted to `localStorage` |

See [`documentation/environments.md`](documentation/environments.md) for exact values per build configuration.

## Getting started

**Prerequisites:** Node **24** (matches CI), npm.

```bash
git clone git@github.com:prospect-tool-relay4u-eu/prospect-tool-fe.git
cd prospect-tool-fe
npm ci
npm start
```

The dev server runs at `http://localhost:4200`. Both backends must be running locally: `eu-relay-4u-prospecting-be` at `http://localhost:8080` and `relay4u-auth-service-be` at `http://localhost:8081`.

## Environment configuration

See [`documentation/environments.md`](documentation/environments.md) for the full table of `apiBase`/`authApiBase` per build configuration (`development`, `sandbox`, `staging`, `production`), including a note on staging/prod `authApiBase` values still awaiting confirmation against a real deploy. Angular's file-replacement mechanism (`angular.json`) swaps in the right environment file per build configuration.

## Available scripts

| Script | Command | Purpose |
|---|---|---|
| `npm start` | `ng serve` | Run the dev server (development config) |
| `npm run build` | `ng build` | Production build (default config) |
| `npm run build:staging` | `ng build --configuration staging` | Staging build |
| `npm run build:prod` | `ng build --configuration production` | Explicit production build |
| `npm run watch` | `ng build --watch --configuration development` | Rebuild on change without serving |
| `npm run serve:staging` | `ng serve --configuration staging` | Dev server against staging environment file |
| `npm test` | `ng test` | Run unit tests (Vitest) |

## Testing

Unit tests run via **Vitest** (through Angular's `@angular/build:unit-test` builder) with `jsdom` as the DOM environment — not Karma/Jasmine. There is currently no end-to-end (e2e) testing framework configured.

## Styling & theming

There is no UI component library. Styling is hand-written CSS in `src/styles.css` using CSS custom properties (`--color-primary`, `--radius`, etc.) as a themeable design system, plus per-component stylesheets. `ThemeService` toggles light/dark mode, respecting `prefers-color-scheme` and persisting the choice to `localStorage`.

## Docker

```bash
docker build --build-arg BUILD_CONFIG=production -t prospect-tool-fe .
docker run -p 8080:80 prospect-tool-fe
```

Multi-stage build: `node:22-alpine` builds the app (`npm ci && npm run build -- --configuration ${BUILD_CONFIG}`), then `nginx:alpine` serves the static output (`dist/eu-relay4u-prospecting/browser`) via `nginx.conf` on port 80.

## Branching model

- **`develop`** — default branch, where all contributor PRs land
- **`main`** — stable/release branch; a `develop` → `main` PR is opened to cut a release
- Both branches are protected: a pull request and a passing CI check are required before merging

## Deployment

GitHub Actions drive CI/CD:
- `ci.yml` — on PR to `develop` or `main`: `npm ci`, `npm run lint`, `npm test -- --watch=false`, `npm run build`
- `deploy-fe-staging.yml` — on push to `main`: builds a Docker image (`BUILD_CONFIG=staging`), pushes to GCP Artifact Registry, deploys to Cloud Run (`relay4u-fe-staging`, `europe-west1`)
- `deploy-fe-prod.yml` — on version tag push (`v*.*.*`): same flow, deploys to Cloud Run (`relay4u-fe-prod`, min 1 / max 10 instances)
- `publish-docker.yml` — on version tag push (`v*.*.*`): builds a Docker image (`BUILD_CONFIG=sandbox`), publishes to `ghcr.io/prospect-tool-relay4u-eu/relay4u-fe`, for the [pentest sandbox](https://github.com/prospect-tool-relay4u-eu/prospect-tool-docker)

## Docker sandbox for security testing

A ready-to-run, self-contained Docker stack (Postgres + backend + frontend) for pentesters and security researchers is available at [`prospect-tool-docker`](https://github.com/prospect-tool-relay4u-eu/prospect-tool-docker) — no local build required, `docker compose up` and go. Findings can be reported as issues on that repo.

This frontend also ships a `sandbox` build configuration (`npm run build:sandbox`) whose `environment.sandbox.ts` points `apiBase` at `http://localhost:8080/api`, matching the sandbox stack's port mapping.

## Known gaps

- No end-to-end test framework is configured yet.

## Contributing

This project is open source and welcomes contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for branching, commit style, and PR guidelines.

## License

This project is licensed under the [MIT License](LICENSE).
