import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VideoGridComponent } from './video-grid/video-grid.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: { background: 'start.jpg' },
  },

  {
    path: 'videos',
    component: VideoGridComponent,

    data: { trailer: 'assets/trailer/video.MOV' },
  },
];
