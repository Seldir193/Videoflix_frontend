import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth.service'; // Pfad ggf. anpassen
import { TranslateService } from '@ngx-translate/core';
import { ToastComponent }   from '../../toast/toast.component'; 

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatSnackBarModule,
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  submitted = false;
  showPassword = false;
  showRepeat = false;

  loading = false;           
  genericError = false; 
 
  private password_match = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const { password, re_password } = group.value;
    return password === re_password ? null : { mismatch: true };
  };

  form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      re_password: ['', Validators.required],
    },
    { validators: this.password_match }
  );

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar,
    private router: Router,
    private translate: TranslateService

  ) {}

  /* ---------- Lifecycle ---------- */
  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  /* ---------- Form Helpers ---------- */
  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }
  get re_password() {
    return this.form.controls.re_password;
  }

  toggle_show_pwd(which: 'pwd' | 'rep'): void {
    which === 'pwd'
      ? (this.showPassword = !this.showPassword)
      : (this.showRepeat = !this.showRepeat);
  }





  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
  
    this.loading = true;
  
    const dto = this.form.getRawValue();
    this.auth.register(dto).subscribe({
      /* ---------- SUCCESS ---------- */
      next: () => {
        this.snack.openFromComponent(ToastComponent, {     // ⚠️ hier open → openFromComponent
          data: this.translate.instant('signup.success'),
          duration: 4000,
          horizontalPosition: 'start',
          verticalPosition:   'bottom',
          panelClass: ['slide-toast', 'no-bg','success' ], // ← extra Klasse
        });
        
        this.router.navigate(['/auth/login']);
      },
  
      /* ---------- ERROR ---------- */
      error: () => {
        this.snack.openFromComponent(ToastComponent, {
          data: this.translate.instant('error.generic'),
          duration: 5000,
          horizontalPosition: 'start',
          verticalPosition:   'bottom',
          panelClass: ['slide-toast', 'no-bg'],            // ohne „success“
        });
        this.loading = false;
      },
  
      complete: () => (this.loading = false),
    });
  }
  










}





