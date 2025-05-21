import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth.service';
import { ToastComponent } from '../../toast/toast.component';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  submitted = false;
  show_password = false;
  genericError = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar,
    private router: Router,
    private translate: TranslateService
  ) {}

  /**──────────────────────────────────────────────
   * 1)   Schon eingeloggt? → sofort zum Dashboard
   *      (ersetzt /auth/login in der History)
   *──────────────────────────────────────────────*/
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
      return; // Rest wird nicht mehr ausgeführt
    }

    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  /* ----- Template Getters ----- */
  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }

  toggle_show_password(): void {
    this.show_password = !this.show_password;
  }

  /**──────────────────────────────────────────────
   * 2)   Nach Login → /dashboard/videos
   *      UND /auth/login-Eintrag ersetzen
   *──────────────────────────────────────────────*/
  

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
  
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {

      
          this.snack.openFromComponent(ToastComponent, {     // ⚠️ hier open → openFromComponent
            data: this.translate.instant('login.success'),
            duration: 4000,
            horizontalPosition: 'start',
            verticalPosition:   'bottom',
            panelClass: ['slide-toast', 'no-bg','success' ], // ← extra Klasse
          });
          
        
        
    


        this.router.navigate(['/dashboard/videos'], { replaceUrl: true });
      },
    
      /* ───── Fehlermeldungen ───── */
      error: (err) => {
        const inactive =
          err.status === 401 &&
          (err.error?.code   === 'no_active_account' ||
           err.error?.detail?.toLowerCase().includes('no active'));

        /* hier: Custom-Toast einblenden */
        this.snack.openFromComponent(ToastComponent, {
          data: this.translate.instant(
            inactive ? 'error.accountInactive' : 'error.generic'
          ),
          duration: 5000,             // schliesst sich nach 5 s
          horizontalPosition: 'start',// von links einblenden
          verticalPosition   : 'bottom',      //  ↓  unten
          panelClass         : ['slide-toast', 'no-bg']
        });
    
        
      }
    });
  }
}