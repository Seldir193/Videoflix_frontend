



import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { ActivateComponent } from './activate.component'; 
//import { GuestGuard } from '../core/guestGuard';



export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    component: LoginComponent,
    //canActivate: [GuestGuard],
    data: { background: 'login.jpg' },
  },

  {
    path: 'signup',
    component: SignupComponent,
    //canActivate: [GuestGuard],
    data: { background: 'sign-up.jpg' },
  },

  {
    path: 'forgot',
    component: ForgotPasswordComponent,
  //canActivate: [GuestGuard],
    data: { background: 'login.jpg' },
  },

  {
    path: 'reset',
    component: ResetPasswordComponent,
    
   // canActivate: [GuestGuard],
    data: { background: 'login.jpg' },
  },

  {
    path: 'reset/:uid/:token',
    component: ResetPasswordComponent,
   // canActivate: [GuestGuard],
    data: { background: 'login.jpg' },
  },

  { path: 'activate/:uid/:token',
    component: ActivateComponent,          // ← eigenständiges Component
    data:{ background:'login.jpg'} }, 


];
