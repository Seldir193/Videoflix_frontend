import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard-routes').then(m => m.DASHBOARD_ROUTES),
  },

  {
    path: 'watch/:id',
    loadComponent: () =>
      import('./watch/watch.component').then(m => m.WatchComponent)
  },

  { path: '**', redirectTo: 'dashboard' }
];

