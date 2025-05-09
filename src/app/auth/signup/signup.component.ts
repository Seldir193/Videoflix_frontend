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

import { AuthService } from '../../core/auth.service';   // Pfad ggf. anpassen

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, MatSnackBarModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  submitted = false;
  showPassword = false;
  showRepeat = false;

  private password_match = (
    group: AbstractControl,
  ): ValidationErrors | null => {
    const { password, re_password } = group.value;
    return password === re_password ? null : { mismatch: true };
  };
 
  form = this.fb.nonNullable.group(
    
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      re_password: ['', Validators.required],
     
    },
    { validators: this.password_match },
   
  );

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar,
    private router: Router,
  ) {}


  /* ---------- Lifecycle ---------- */
  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => (this.submitted = false));
  }

  /* ---------- Form Helpers ---------- */
  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }
  get re_password() { return this.form.controls.re_password; }

  toggle_show_pwd(which: 'pwd' | 'rep'): void {
    which === 'pwd' ? (this.showPassword = !this.showPassword)
                    : (this.showRepeat = !this.showRepeat);
  }



  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
  
    const dto = this.form.getRawValue();   // ← statt this.form.value
    this.auth.register(dto).subscribe({
      next: () => {
        this.snack.open(
          'Registrierung erfolgreich – bitte E-Mail bestätigen.',
          undefined,
          { duration: 4000 },
        );
        //this.router.navigate(['/login']);
        this.router.navigate(['/auth/login']);
      },
      error: () =>
        this.snack.open(
          'Bitte überprüfe deine Eingaben und versuche es erneut.',
          undefined,
          { duration: 4000 },
        ),
    });
  }




}



