import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

const RESEND_COOLDOWN_SECONDS = 60;
const CODE_EXPIRY_SECONDS = 15 * 60;

@Component({
  selector: 'app-verify-email',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly theme = inject(ThemeService);
  private readonly fb = inject(FormBuilder);

  readonly email = signal<string>('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly resendLoading = signal(false);
  readonly resendError = signal<string | null>(null);
  readonly resendSuccess = signal(false);

  readonly codeTimeLeft = signal(CODE_EXPIRY_SECONDS);
  readonly resendCooldown = signal(RESEND_COOLDOWN_SECONDS);

  private codeTimer: ReturnType<typeof setInterval> | null = null;
  private resendTimer: ReturnType<typeof setInterval> | null = null;

  readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  ngOnInit(): void {
    const raw = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.email.set(decodeURIComponent(raw));
    this.startCodeTimer();
    this.startResendCooldown();
  }

  ngOnDestroy(): void {
    if (this.codeTimer) clearInterval(this.codeTimer);
    if (this.resendTimer) clearInterval(this.resendTimer);
  }

  private startCodeTimer(): void {
    if (this.codeTimer) clearInterval(this.codeTimer);
    this.codeTimer = setInterval(() => {
      this.codeTimeLeft.update(v => (v > 0 ? v - 1 : 0));
    }, 1000);
  }

  private startResendCooldown(): void {
    this.resendCooldown.set(RESEND_COOLDOWN_SECONDS);
    if (this.resendTimer) clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      this.resendCooldown.update(v => {
        if (v <= 1) {
          clearInterval(this.resendTimer!);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  get canResend(): boolean {
    return this.resendCooldown() === 0 && !this.resendLoading();
  }

  get formattedTimeLeft(): string {
    const s = this.codeTimeLeft();
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.verifyEmail(this.email(), this.form.value.code!).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
      },
      error: err => {
        this.error.set(this.mapVerifyError(err.status, err.error?.detail));
        this.loading.set(false);
      },
    });
  }

  resend(): void {
    if (!this.canResend) return;
    this.resendLoading.set(true);
    this.resendError.set(null);
    this.resendSuccess.set(false);
    this.auth.resendVerification(this.email()).subscribe({
      next: () => {
        this.resendLoading.set(false);
        this.resendSuccess.set(true);
        this.codeTimeLeft.set(CODE_EXPIRY_SECONDS);
        this.startCodeTimer();
        this.startResendCooldown();
      },
      error: err => {
        this.resendLoading.set(false);
        this.resendError.set(
          err.status === 429
            ? 'Przekroczono limit wysyłania kodów. Poczekaj godzinę.'
            : 'Nie udało się wysłać kodu. Spróbuj ponownie.'
        );
      },
    });
  }

  private mapVerifyError(status: number, detail?: string): string {
    switch (status) {
      case 400:
        return detail ?? 'Nieprawidłowy lub wygasły kod weryfikacyjny.';
      case 423:
        return 'Konto zablokowane po zbyt wielu próbach. Poproś o nowy kod.';
      default:
        return 'Wystąpił błąd. Spróbuj ponownie.';
    }
  }
}
