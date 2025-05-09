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

import { AuthService } from '../../core/auth.service'; // Pfad ggf. anpassen

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

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  /* --------- Template Getters --------- */
  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }

  toggle_show_password(): void {
    this.show_password = !this.show_password;
  }



submit(): void {
  this.submitted = true;
  if (this.form.invalid) return;

  const creds = this.form.getRawValue();   // ← statt this.form.value
  this.auth.login(creds).subscribe({
    next: (tokens) => {
      this.auth.saveTokens(tokens);
      this.router.navigate(['/dashboard/videos']);
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