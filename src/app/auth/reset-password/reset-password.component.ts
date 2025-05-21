import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth.service';
import { ToastComponent } from '../../toast/toast.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, MatSnackBarModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {

  uid = '';   // kommt aus Route
  token = '';

  submitted = false;
  loading = false;
  done = false;

  form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      re_password: ['', Validators.required],
      repeat: ['', Validators.required],
    },
    { validators: this.samePwd }
  );

  showPassword = false;   // Für das Umschalten der Passwortsichtbarkeit
  showRepeat = false;     // Für das Umschalten der Wiederholungssichtbarkeit

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private snack: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid')!;
    this.token = this.route.snapshot.paramMap.get('token')!;

    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  private samePwd(group: AbstractControl): ValidationErrors | null {
    const { password, re_password } = group.value;
    return password === re_password ? null : { mismatch: true };
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;

    const dto = {
      uid: this.uid,
      token: this.token,
      password: this.form.value.password!,
      re_password: this.form.value.re_password!,
    };

    this.auth.confirmPasswordReset(dto).subscribe({
      next: () => this.showSuccess(),
      error: () => this.showError(),
    });
  }

  private showSuccess(): void {
    this.snack.openFromComponent(ToastComponent, {
      data: this.translate.instant('reset.success'),
      duration: 4000,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
      panelClass: ['slide-toast', 'no-bg', 'success'],
    });
    this.done = true;
    this.loading = false;

    // 3 s später automatisch zum Login
    setTimeout(() => this.router.navigate(['/auth/login']), 3000);
  }

  private showError(): void {
    this.snack.openFromComponent(ToastComponent, {
      data: this.translate.instant('reset.error'),
      duration: 5000,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
      panelClass: ['slide-toast', 'no-bg'],
    });
    this.loading = false;
  }

  /* Template Getter */
  get password() { return this.form.controls.password; }
  get re_password() { return this.form.controls.re_password; }

  get repeat() {
    return this.form.controls.repeat;
  }
  

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleShowRepeat(): void {
    this.showRepeat = !this.showRepeat;
  }
}
