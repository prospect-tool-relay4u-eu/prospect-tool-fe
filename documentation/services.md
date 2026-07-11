# Core services

All services live under `src/app/core/services/`, are `providedIn: 'root'`, and use `inject()` rather than constructor injection.

## `AuthService` (`auth.service.ts`)

Talks to `environment.authApiBase` (the auth microservice). Holds the JWT in a signal, backed by `sessionStorage` (key `r4u-token`).

| Member | Purpose |
|---|---|
| `isLoggedIn` (signal) | `true` if a token is present — presence check only, does **not** verify expiry |
| `userEmail` (signal) | Decodes the JWT payload client-side and returns the `name` claim (property name is a legacy misnomer — it returns the display name, not the email) |
| `login(email, password)` | `POST authApiBase/auth/login`; on success stores the token. Does **not** catch or map errors — a failed login (including `428` for a `password = NULL` account) propagates the raw `HttpErrorResponse` to the caller; `LoginComponent` is what inspects `err.status` and handles the `428` redirect (see [`interceptors-guards.md`](interceptors-guards.md#note-on-428)) |
| `register(name, email, password, confirmPassword)` | `POST authApiBase/auth/register`; response is ignored by callers (no auto-login) |
| `verifyEmail(email, code)` | `POST authApiBase/auth/verify-email` |
| `resendVerification(email)` | `POST authApiBase/auth/resend-verification` |
| `logout()` | Clears the token and navigates to `/` |
| `getToken()` | Returns the current raw token, used by `authInterceptor` |

JWT decoding uses a `decodeJwtPayload` helper that converts base64url → base64, decodes via `atob`, then re-decodes the resulting byte string as UTF-8 with `TextDecoder` — plain `atob` + `JSON.parse` mangles non-ASCII characters (e.g. Polish diacritics) because `atob` returns a Latin-1 binary string, not a UTF-8 string.

## `ProjectService` (`project.service.ts`)

Talks to `environment.apiBase` (the prospecting backend). Exposes a `projects` signal as client-side cache.

| Method | Purpose |
|---|---|
| `loadProjects()` | `GET /projects`, refreshes the `projects` signal |
| `getProject(id)` | `GET /projects/{id}` |
| `createProject(name, description)` | `POST /projects` |
| `updateProject(id, data)` | `PUT /projects/{id}` |
| `deleteProject(id)` | `DELETE /projects/{id}` |
| `addField(projectId, data)` | `POST /projects/{id}/fields` |
| `removeField(projectId, fieldId)` | `DELETE /projects/{id}/fields/{fieldId}` |
| `reorderFields(projectId, fieldIds)` | `PUT /projects/{id}/fields/order` |

## `RecordService` (`record.service.ts`)

Also talks to `environment.apiBase`.

| Method | Purpose |
|---|---|
| `getRecords(projectId)` | `GET /projects/{id}/records` |
| `createRecord(projectId)` | `POST /projects/{id}/records` |
| `updateRecord(recordId, values)` | `PUT /records/{id}` |
| `deleteRecord(recordId)` | `DELETE /records/{id}` |
| `deleteAllRecords(projectId)` | `DELETE /projects/{id}/records` (bulk clear) |

## `ThemeService` (`theme.service.ts`)

No backend calls. Exposes a `theme` signal (`'light' | 'dark'`), persisted to `localStorage`, initialized from the stored preference or `prefers-color-scheme` if unset. An `effect()` syncs the `data-theme` attribute on the document root whenever the signal changes.

| Method | Purpose |
|---|---|
| `toggle()` | Flips between light and dark |
