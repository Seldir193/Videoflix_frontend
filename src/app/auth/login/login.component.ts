import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth.service';

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

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar,
    private router: Router,
  ) {}

  /**──────────────────────────────────────────────
   * 1)   Schon eingeloggt? → sofort zum Dashboard
   *      (ersetzt /auth/login in der History)
   *──────────────────────────────────────────────*/
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
      return;                               // Rest wird nicht mehr ausgeführt
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

    const creds = this.form.getRawValue();
    this.auth.login(creds).subscribe({
      next: (tokens) => {
        this.auth.saveTokens(tokens);

        /* <<< Hier entscheidend: replaceUrl: true >>> */
        this.router.navigate(['/dashboard/videos'], { replaceUrl: true });
      },
      error: () =>
        this.snack.open(
          'Bitte überprüfe deine Eingaben und versuche es erneut.',
          undefined,
          { duration: 3500 },
        ),
    });
  }
}
