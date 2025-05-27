import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ActivateComponent } from './activate.component';
import { PolicyComponent } from '../policy/policy.component';
import { ImprintComponent } from '../imprint/imprint.component';

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
    path: 'reset-password/:uid/:token',
    component: ResetPasswordComponent,
    data: { background: 'login.jpg' },
  },

  {
    path: 'activate/:uid/:token',
    component: ActivateComponent,
    data: { background: 'login.jpg' },
  },

  {
    path: 'datenschutz',
    component: PolicyComponent,
    data: { background: 'login.jpg' },
  },
  {
    path: 'impressum',
    component: ImprintComponent,
    data: { background: 'login.jpg' },
  },
];
