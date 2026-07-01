# EU Relay 4U — Prospecting Frontend

Angular frontend for the EU Relay 4U prospecting tool — a schema-less prospecting/lead-tracking application.

## Overview

Users register, verify their email with a 6-digit code, and log in to create **Projects**. Each project has user-defined **Fields** (like flexible spreadsheet columns — string, boolean, integer, or number), which are filled in as **Records** in an inline-editable data grid. This app is the UI consumed by the [`eu-relay-4u-prospecting-be`](../eu-relay-4u-prospecting-be) Spring Boot backend.

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
- `AuthService` decodes the JWT payload client-side (`atob`) purely to display the logged-in user's email — this is not a trust boundary; all real authorization happens on the backend.

## API integration

All requests go through `environment.apiBase` (e.g. `http://localhost:8080/api` in development).

| Service | Backend endpoints |
|---|---|
| `AuthService` | `POST /auth/login`, `/auth/register`, `/auth/verify-email`, `/auth/resend-verification` |
| `ProjectService` | `GET/POST /projects`, `GET/PUT/DELETE /projects/{id}`, `POST/DELETE /projects/{id}/fields[/{fieldId}]`, `PUT /projects/{id}/fields/order` |
| `RecordService` | `GET/POST /projects/{id}/records`, `DELETE /projects/{id}/records` (bulk), `PUT/DELETE /records/{id}` |
| `ThemeService` | No backend calls — client-side light/dark theme, persisted to `localStorage` |

## Getting started

**Prerequisites:** Node **24** (matches CI), npm.

```bash
git clone git@github.com:prospect-tool-relay4u-eu/prospect-tool-fe.git
cd prospect-tool-fe
npm ci
npm start
```

The dev server runs at `http://localhost:4200`. The backend (`eu-relay-4u-prospecting-be`) must be running locally at `http://localhost:8080` for API calls to succeed.

## Environment configuration

| File | Used by | `apiBase` |
|---|---|---|
| `src/environments/environment.ts` | `development` build/serve config (default) | `http://localhost:8080/api` |
| `src/environments/environment.staging.ts` | `staging` build config | staging backend URL |
| `src/environments/environment.prod.ts` | `production` build config (default for `ng build`) | production backend URL |

Angular's file-replacement mechanism (`angular.json`) swaps in the right environment file per build configuration — there are no other environment variables to configure.

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

## Deployment

GitHub Actions drive CI/CD:
- `ci.yml` — on PR to `main`: `npm ci`, `npm run lint`, `npm test -- --watch=false --browsers=ChromeHeadless`, `npm run build`
- `deploy-fe-staging.yml` — on push to `main`: builds a Docker image (`BUILD_CONFIG=staging`), pushes to GCP Artifact Registry, deploys to Cloud Run (`relay4u-fe-staging`, `europe-west1`)
- `deploy-fe-prod.yml` — on version tag push (`v*.*.*`): same flow, deploys to Cloud Run (`relay4u-fe-prod`, min 1 / max 10 instances)

## Known gaps

- `ci.yml` runs `npm run lint`, but the repo currently has **no `lint` script and no ESLint configuration**. This CI step will fail until linting is set up — flagging this for contributors rather than silently working around it.
- No end-to-end test framework is configured yet.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branching, commit style, and PR guidelines.

## License

This project is licensed under the [MIT License](LICENSE).
