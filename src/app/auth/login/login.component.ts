/*****************************************************************
 *  login.component.ts  –  Variante B (kein Redirect, wenn ?activated=…)
 *****************************************************************/
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth.service';
import { ToastComponent } from '../../toast/toast.component';




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
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  /* --------------------- Form ---------------------- */
  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  /* ---------------- Dependencies ------------------- */
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  

  /* ---------------- UI Flags ----------------------- */
  submitted = false;
  show_password = false;
  genericError = '';

  /* -------------- Template-Getter ------------------ */
  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }

  /* ================================================= */
  ngOnInit(): void {
    const fromBack = history.state?.routerTrigger === 'popstate';

    /* ------------------------------------------------------------
     * B) Wenn eingeloggt UND NICHT per Zurück,
     *    dann → Dashboard
     * ------------------------------------------------------------ */
    if (this.auth.isLoggedIn() && !fromBack) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
      return;
    }

    /* ------------------------------------------------------------
     * C) Aktivierungs-Snackbar
     * ------------------------------------------------------------ */
    const activated = this.route.snapshot.queryParamMap.get('activated');
    if (activated === 'yes') {
      this.showToast('login.accountActivated', true);
    } else if (activated === 'fail') {
      this.showToast('login.activationFailed', false, 3000);
    }

    /* ------------------------------------------------------------
     * D) Formular Änderungen
     * ------------------------------------------------------------ */
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  /* --------------- UI-Helfer ------------------------ */
  toggle_show_password(): void {
    this.show_password = !this.show_password;
  }

  /* --------------- Login senden -------------------- */
  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const ref = this.snack.openFromComponent(ToastComponent, {
          data: this.translate.instant('login.success'),
          duration: 2000,                    // ← wie lange sichtbar?
          horizontalPosition: 'left',
          verticalPosition: 'bottom',
          panelClass: ['slide-toast', 'no-bg', 'success'],
        });
  
        // erst wenn die 2 s vorbei sind ➜ Route wechseln
        ref.afterDismissed().subscribe(() =>
          this.router.navigate(['/dashboard/videos'], { replaceUrl: true })
        );
      },

      error: (err) => {
        const inactive =
          err.status === 401 &&
          (err.error?.code === 'no_active_account' ||
            err.error?.detail?.toLowerCase().includes('no active'));

        this.showToast(
          inactive ? 'error.accountInactive' : 'error.generic',
          false,
          5000
        );
      },
    });

   
  }

  

  /* --------------- Toast-Helfer -------------------- */
  private showToast(key: string, success = false, dur = 3000) {
    this.snack.openFromComponent(ToastComponent, {
      data: this.translate.instant(key),
      duration: dur,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
      panelClass: ['slide-toast', 'no-bg'].concat(success ? ['success'] : []),
      
  
    });
  }
}
