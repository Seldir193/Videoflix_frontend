import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { ToastComponent } from '../../toast/toast.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatSnackBarModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  uid = '';
  token = '';
  submitted = false;
  loading = false;
  done = false;

  form = this.fb.nonNullable.group(
    {
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      re_new_password: ['', Validators.required],
    },
    { validators: this.samePwd }
  );

  showPassword = false;
  showRepeat = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private snack: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid') || '';
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  private samePwd(group: AbstractControl): ValidationErrors | null {
    const { new_password, re_new_password } = group.value;
    return new_password === re_new_password ? null : { mismatch: true };
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    this.auth.confirmPasswordReset(this.buildDto()).subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError(),
    });
  }

  private handleSuccess(): void {
    this.openToast('reset.success', true);
    this.done = true;
    this.loading = false;

    setTimeout(() => this.router.navigate(['/auth/login']), 3000);
  }

  private handleError(): void {
    this.openToast('reset.error');
    this.loading = false;
  }

  private buildDto() {
    return {
      uid: this.uid,
      token: this.token,
      new_password: this.form.value.new_password!,
      re_new_password: this.form.value.re_new_password!,
    };
  }

  private openToast(key: string, success = false, dur = 3000) {
    return this.snack.openFromComponent(ToastComponent, {
      data: this.translate.instant(key),
      duration: dur,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
      panelClass: ['slide-toast', 'no-bg'].concat(success ? ['success'] : []),
    });
  }

  get password() {
    return this.form.controls.new_password;
  }
  get re_password() {
    return this.form.controls.re_new_password;
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
  toggleShowRepeat() {
    this.showRepeat = !this.showRepeat;
  }
}
