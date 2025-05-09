



import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
//import { guestGuard } from '../core/guest.guard';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    component: LoginComponent,
    //canActivate: [guestGuard],
    data: { background: 'login.jpg' },
  },

  {
    path: 'signup',
    component: SignupComponent,
   // canActivate: [guestGuard],
    data: { background: 'sign-up.jpg' },
  },

  {
    path: 'forgot',
    component: ForgotPasswordComponent,
    //canActivate: [guestGuard],
    data: { background: 'login.jpg' },
  },

  {
    path: 'reset',
    component: ResetPasswordComponent,
   // canActivate: [guestGuard],
    data: { background: 'login.jpg' },
  },

  {
    path: 'reset/:uid/:token',
    component: ResetPasswordComponent,
    //canActivate: [guestGuard],
    data: { background: 'login.jpg' },
  },
];


