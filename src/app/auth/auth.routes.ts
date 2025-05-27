



import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ActivateComponent } from './activate.component'; 
import { PolicyComponent } from '../policy/policy.component';
import { ImprintComponent } from '../imprint/imprint.component';

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
    path: 'reset-password/:uid/:token', // route für reset-password
    component: ResetPasswordComponent,
    data: { background: 'login.jpg' },
  },
  

  { path: 'activate/:uid/:token',
    component: ActivateComponent,          // ← eigenständiges Component
    data:{ background:'login.jpg'} }, 


    {
      path: 'datenschutz',
      component: PolicyComponent,  // Route für die Datenschutzerklärung
      data: { background: 'login.jpg' },
    },
    {
      path: 'impressum',
      component: ImprintComponent,  // Route für das Impressum
      data: { background: 'login.jpg' },
    },



];
