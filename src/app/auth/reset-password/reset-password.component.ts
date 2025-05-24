
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

  uid = '';   // UID aus der URL
  token = ''; // Token aus der URL

  submitted = false;
  loading = false;
  done = false; // Status, ob der Benutzer das Passwort erfolgreich zurückgesetzt hat

  
  form = this.fb.nonNullable.group(
    {
      new_password: ['', [Validators.required, Validators.minLength(8)]],  // Passwort mit Mindestlänge
      re_new_password: ['', Validators.required], // Passwort-Wiederholung
    },
    { validators: this.samePwd } // Validierung für Passwort-Wiederholung
  );

  showPassword = false;   // Toggle für Passwort-Sichtbarkeit
  showRepeat = false;     // Toggle für Wiederholungs-Passwort-Sichtbarkeit

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private snack: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // UID und Token aus der URL auslesen
    this.uid = this.route.snapshot.paramMap.get('uid')!;
    this.token = this.route.snapshot.paramMap.get('token')!;

    this.form.valueChanges.subscribe(() => (this.submitted = false)); // Zurücksetzen der "submitted"-Status bei Form-Änderung
  }

  private samePwd(group: AbstractControl): ValidationErrors | null {
    const { new_password, re_new_password } = group.value;
    return new_password === re_new_password ? null : { mismatch: true }; // Überprüfen, ob die Passwörter übereinstimmen
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;

    
    // Daten für die Passwortbestätigung
    const dto = {
      uid: this.uid,
      token: this.token,
      new_password: this.form.value.new_password!,
      re_new_password: this.form.value.re_new_password!
    };

    // Anfrage an den AuthService zur Bestätigung des Passworts
    this.auth.confirmPasswordReset(dto).subscribe({
      next: () => this.showSuccess(),  // Bei Erfolg
      error: () => this.showError(),   // Bei Fehler
    });
  }

  // Erfolgsmeldung anzeigen
  private showSuccess(): void {
    this.snack.openFromComponent(ToastComponent, {
      data: this.translate.instant('reset.success'), // Erfolgsmeldung
      duration: 4000,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
      panelClass: ['slide-toast', 'no-bg', 'success'],
    });
    this.done = true;
    this.loading = false;

    // 3 Sekunden später zum Login-Bereich weiterleiten
    setTimeout(() => this.router.navigate(['/auth/login']), 3000);
  }

  // Fehlermeldung anzeigen
  private showError(): void {
    this.snack.openFromComponent(ToastComponent, {
      data: this.translate.instant('reset.error'), // Fehlermeldung
      duration: 5000,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
      panelClass: ['slide-toast', 'no-bg'],
    });
    this.loading = false;
  }

  get password() { return this.form.controls.new_password; }
  get re_password() { return this.form.controls.re_new_password; }

  // Toggle für die Sichtbarkeit des Passworts
  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle für die Sichtbarkeit der Passwort-Wiederholung
  toggleShowRepeat(): void {
    this.showRepeat = !this.showRepeat;
  }
}







