import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    const { email, password } = this.form.value;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error.set(
          err.status === 401
            ? 'Nieprawidłowy email lub hasło.'
            : 'Wystąpił błąd. Spróbuj ponownie.'
        );
        this.loading.set(false);
      },
    });
  }
}
