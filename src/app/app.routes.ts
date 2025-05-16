
import { Routes } from '@angular/router';
//import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.AUTH_ROUTES),   // ← Pfad exakt?
  },





  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard-routes').then(m => m.DASHBOARD_ROUTES),
   // canActivate: [AuthGuard],
  },

  {
    path: 'watch/:id',
    loadComponent: () =>
      import('./watch/watch.component').then(m => m.WatchComponent),
  // canActivate: [AuthGuard],          // ← optional, aber meist sinnvoll
  },

  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./movie-info/movie-info.component').then(m => m.MovieInfoComponent),
  },


  { path: '**', redirectTo: 'dashboard' },

];














