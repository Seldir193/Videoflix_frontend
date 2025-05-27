
import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { PolicyComponent } from './policy/policy.component';
import { ImprintComponent } from './imprint/imprint.component';

export const routes: Routes = [
  //{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.AUTH_ROUTES),   // ← Pfad exakt?
  },


  
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard-routes').then(m => m.DASHBOARD_ROUTES),
    //canActivate: [AuthGuard],
  },

  {
    path: 'watch/:id',
    loadComponent: () =>
      import('./watch/watch.component').then(m => m.WatchComponent),
   canActivate: [AuthGuard],          // ← optional, aber meist sinnvoll
  },

  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./movie-info/movie-info.component').then(m => m.MovieInfoComponent),
    canActivate: [AuthGuard],   
  },

  { path: 'datenschutz', component: PolicyComponent },

  { path: 'impressum', component: ImprintComponent},

  //{ path: '**', redirectTo: 'dashboard' },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },

];
