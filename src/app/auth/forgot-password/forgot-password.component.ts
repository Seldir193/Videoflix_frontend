import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  submitted = false;
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.router.navigate(['/auth/reset']);
  }

  get email() {
    return this.form.controls.email;
  }
}
