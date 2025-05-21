import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-email-capture',
  templateUrl: './email-capture.component.html',
  styleUrls: ['./email-capture.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
})
export class EmailCaptureComponent {
  /** Reactive-Form mit einfacher E-Mail-Validierung */
  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  /** Optional: E-Mail nach außen geben (z. B. Analytics) */
  @Output() captured = new EventEmitter<string>();

  constructor(private fb: FormBuilder, private router: Router) {}

  /** Getter für übersichtliches Template-Binding */
  get emailCtrl() {
    return this.emailForm.controls.email;
  }

  /** Einziger Submit-Pfad */
  submit(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const email = this.emailCtrl.value;
    this.captured.emit(email);                                 // optional
    this.router.navigate(['/auth/signup'], { queryParams: { email } });
  }
}
