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
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  submitted = false;
  showPassword = false;
  showRepeat = false;

  form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeat: ['', Validators.required],
    },
    { validators: this.samePwd }
  );

  constructor(private fb: FormBuilder, private router: Router) {}

  samePwd(group: AbstractControl): ValidationErrors | null {
    const pw = group.get('password')?.value;
    const rep = group.get('repeat')?.value;
    return pw === rep ? null : { mismatch: true };
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.router.navigate(['/dashboard']);
  }

  get email() {
    return this.form.controls.email;
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
