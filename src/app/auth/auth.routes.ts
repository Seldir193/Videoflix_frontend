import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    component: LoginComponent,
    data: { background: 'login.jpg' },
  },

  {
    path: 'signup',
    component: SignupComponent,
    data: { background: 'sign-up.jpg' },
  },

  {
    path: 'forgot',
    component: ForgotPasswordComponent,
    data: { background: 'login.jpg' },
  },

  {
    path: 'reset',
    component: ResetPasswordComponent,
    data: { background: 'login.jpg' },
  },

  {
    path: 'reset/:uid/:token',
    component: ResetPasswordComponent,
    data: { background: 'login.jpg' },
  },
];
