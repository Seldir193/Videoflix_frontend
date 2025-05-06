

import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule,
         FormBuilder,
         Validators }         from '@angular/forms';
import { TranslateModule }    from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  submitted    = false;
  showPassword = false;

  form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    /* Fehlzustand zurücksetzen, sobald der Nutzer tippt */
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  /** Formular absenden */
  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    /* ← TODO: echten Auth-Service aufrufen */

    /* Erfolg → zur Video-Seite mit Autoplay-Flag */
    this.router.navigate(
      ['/dashboard/videos'],          // oder dein tatsächlicher Pfad
      { queryParams: { autoplay: 'true' } }
    );
  }

  /* Getter fürs Template */
  get email()    { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
}
