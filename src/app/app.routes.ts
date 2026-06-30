import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/list/projects-list.component').then(m => m.ProjectsListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/table/project-table.component').then(m => m.ProjectTableComponent),
    canActivate: [authGuard],
  },
  {
    path: 'projects/:id/settings',
    loadComponent: () =>
      import('./features/projects/settings/project-settings.component').then(m => m.ProjectSettingsComponent),
    canActivate: [authGuard],
  },
  { path: 'dashboard', redirectTo: '/projects', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
