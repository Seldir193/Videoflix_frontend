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

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  submitted = false;
  showPassword = false;
  showRepeat = false;
  form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeat: ['', Validators.required],
    },
    { validators: this.samePwd }
  );

  constructor(private fb: FormBuilder, private router: Router) {}

  private samePwd(group: AbstractControl): ValidationErrors | null {
    const pw = group.get('password')?.value;
    const rep = group.get('repeat')?.value;
    return pw === rep ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.router.navigate(['/auth/login']);
  }

  get password() {
    return this.form.controls.password;
  }
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
