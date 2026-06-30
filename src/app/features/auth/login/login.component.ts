import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly theme = inject(ThemeService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly verified = signal(false);

  ngOnInit(): void {
    this.verified.set(this.route.snapshot.queryParamMap.get('verified') === 'true');
  }

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
            ? 'Invalid email or password.'
            : err.status === 403
              ? err.error?.detail ?? 'Account not verified. Check your email inbox.'
              : 'An error occurred. Please try again.'
        );
        this.loading.set(false);
      },
    });
  }
}
