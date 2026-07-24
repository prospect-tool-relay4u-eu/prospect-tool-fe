import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('password');
  const confirm = control.get('confirmPassword');
  if (pw && confirm && pw.value !== confirm.value) {
    return { passwordsMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly theme = inject(ThemeService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly resumingSetup = signal(false);
  readonly stagingCode = signal<string | null>(null);

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    const name = this.route.snapshot.queryParamMap.get('name');
    if (email && name) {
      this.form.patchValue({ email, name });
      this.resumingSetup.set(true);
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    const { name, email, password, confirmPassword } = this.form.value;
    this.loading.set(true);
    this.error.set(null);
    this.auth.register(name!, email!, password!, confirmPassword!).subscribe({
      next: res => {
        this.success.set(true);
        this.stagingCode.set(res.verificationCode ?? null);
        setTimeout(
          () => this.router.navigate(['/verify-email'], { queryParams: { email: encodeURIComponent(email!) } }),
          1500
        );
      },
      error: err => {
        this.error.set(
          err.status === 409
            ? 'An account with this email already exists.'
            : 'An error occurred. Please try again.'
        );
        this.loading.set(false);
      },
    });
  }
}
