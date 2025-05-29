import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { ToastComponent } from '../../toast/toast.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatSnackBarModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  submitted = false;
  loading = false;
  done = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar,
    private translate: TranslateService,
    private router: Router
  ) {}

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    const email = this.form.value.email ?? '';

    this.auth.requestPasswordReset(email).subscribe({
      next: () => this.showSuccess(),
      error: () => this.showError(),
    });
  }

  private showSuccess(): void {
    this.snack.openFromComponent(ToastComponent, {
      data: this.translate.instant('forgot.success'),
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
      panelClass: ['slide-toast', 'no-bg', 'success'],
    });
    this.done = true;
    this.loading = false;
  }

  private showError(): void {
    this.snack.openFromComponent(ToastComponent, {
      data: this.translate.instant('forgot.error'),
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
      panelClass: ['slide-toast', 'no-bg', 'error'],
    });
    this.loading = false;
  }

  get email() {
    return this.form.controls.email;
  }
}