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
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  submitted = false;
  show_password = false;
  genericError: string | null = null;

  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }

  ngOnInit(): void {
    this.redirectIfLoggedIn();
    this.checkActivationToast();
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  toggle_show_password(): void {
    this.show_password = !this.show_password;
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.handleSuccess(),
      error: (e) => this.handleError(e),
    });
  }

  private handleSuccess(): void {
    const ref = this.openToast('login.success', true, 2000);
    ref
      .afterDismissed()
      .subscribe(() =>
        this.router.navigate(['/dashboard/videos'], { replaceUrl: true })
      );
  }

  private handleError(err: any): void {
    const inactive =
      err.status === 401 &&
      (err.error?.code === 'no_active_account' ||
        err.error?.detail?.toLowerCase().includes('no active'));

    const key = inactive ? 'error.accountInactive' : 'error.generic';
    this.genericError = key;
    this.openToast(key, false, 5000);
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

  private redirectIfLoggedIn(): void {
    const fromBack = history.state?.routerTrigger === 'popstate';
    if (this.auth.isLoggedIn() && !fromBack) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  private checkActivationToast(): void {
    const activated = this.route.snapshot.queryParamMap.get('activated');
    if (activated === 'yes') {
      this.openToast('login.accountActivated', true);
    } else if (activated === 'fail') {
      this.openToast('login.activationFailed', false, 3000);
    }
  }
}
