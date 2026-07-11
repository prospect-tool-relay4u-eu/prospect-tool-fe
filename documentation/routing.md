# Routing

All routes are declared in `src/app/app.routes.ts` as lazy-loaded standalone components (`loadComponent`) — there are no `NgModule`-based routes in this app.

## Routes

| Path | Component | Guard | Purpose |
|---|---|---|---|
| `` (root) | `LandingComponent` | – | Public marketing/landing page |
| `login` | `LoginComponent` | – | Sign in |
| `register` | `RegisterComponent` | – | Create an account |
| `verify-email` | `VerifyEmailComponent` | – | Enter the 6-digit email verification code |
| `projects` | `ProjectsListComponent` | `authGuard` | List the current user's projects |
| `projects/:id` | `ProjectTableComponent` | `authGuard` | Spreadsheet-style view/edit of a project's records |
| `projects/:id/settings` | `ProjectSettingsComponent` | `authGuard` | Manage project name/description and field definitions |
| `dashboard` | – (redirect) | – | Redirects to `/projects`, `pathMatch: 'full'` |
| `**` | – (redirect) | – | Redirects to `` (root) |

`authGuard` is defined in `src/app/core/guards/auth.guard.ts` — see [`interceptors-guards.md`](interceptors-guards.md).

## `register` query params: `email` / `name`

`RegisterComponent.ngOnInit()` reads optional `email`/`name` query params off the route. When both are present, it pre-fills the form and sets a `resumingSetup` signal (shows an info alert telling the user to set a new password and re-verify their email). This is how the login page's `428` redirect (see [`interceptors-guards.md`](interceptors-guards.md#note-on-428) and the root [`README.md`](../README.md#password-reset-redirect-http-428)) hands off to the register page for password-less/reclaimed accounts.

## Known gap: orphaned `DashboardComponent`

`src/app/features/dashboard/dashboard.component.ts` exists as a real component, but no route renders it — the `/dashboard` path just redirects straight to `/projects`. If you're looking for where the dashboard is wired up, it isn't; either finish wiring it in or remove it.

## Feature folder → route mapping

| Feature folder | Component(s) | Route(s) |
|---|---|---|
| `features/landing` | `LandingComponent` | `` |
| `features/auth/login` | `LoginComponent` | `login` |
| `features/auth/register` | `RegisterComponent` | `register` |
| `features/auth/verify-email` | `VerifyEmailComponent` | `verify-email` |
| `features/projects/list` | `ProjectsListComponent` | `projects` |
| `features/projects/table` | `ProjectTableComponent` | `projects/:id` |
| `features/projects/settings` | `ProjectSettingsComponent` | `projects/:id/settings` |
| `features/dashboard` | `DashboardComponent` | *(none — see gap above)* |
| `features/shared/navbar` | `NavbarComponent` | *(not a route — rendered by the app shell)* |
