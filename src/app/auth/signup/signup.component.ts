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
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastComponent } from '../../toast/toast.component';
import { ActivatedRoute } from '@angular/router'; 
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
  loading = false;
  showPassword = false;
  showRepeat = false;

  private password_match = (g: AbstractControl): ValidationErrors | null =>
    g.value.password === g.value.re_password ? null : { mismatch: true };

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
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
  if (email) {
    this.form.patchValue({ email });
    // optional: sofort als touched markieren
    // this.email.markAsTouched();
  }
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }
  get re_password() {
    return this.form.controls.re_password;
  }

  toggle_show_pwd(which: 'pwd' | 'rep') {
    which === 'pwd'
      ? (this.showPassword = !this.showPassword)
      : (this.showRepeat = !this.showRepeat);
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError(),
      complete: () => (this.loading = false),
    });
  }

  private handleSuccess(): void {
    this.openToast('signup.success', true);
    this.router.navigate(['/auth/login']);
  }

  private handleError(): void {
    this.openToast('error.generic', false);
    this.loading = false;
  }

  private openToast(key: string, success = false, dur = 3000) {
    this.snack.openFromComponent(ToastComponent, {
      data: this.translate.instant(key),
      duration: dur,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
      panelClass: ['slide-toast', 'no-bg'].concat(success ? ['success'] : []),
    });
  }
}
