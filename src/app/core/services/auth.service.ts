import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  id: number;
  name: string;
  email: string;
}

import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'r4u-token';

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const json = new TextDecoder('utf-8').decode(bytes);
  return JSON.parse(json);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));

  readonly isLoggedIn = computed(() => !!this._token());

  readonly userEmail = computed((): string | null => {
    const t = this._token();
    if (!t) return null;
    try {
      const payload = decodeJwtPayload(t);
      return payload['name'] as string;
    } catch {
      return null;
    }
  });

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.authApiBase}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          this._token.set(res.token);
          sessionStorage.setItem(TOKEN_KEY, res.token);
        })
      );
  }

  register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.authApiBase}/auth/register`, {
      name,
      email,
      password,
      confirmPassword,
    });
  }

  verifyEmail(email: string, code: string): Observable<void> {
    return this.http.post<void>(`${environment.authApiBase}/auth/verify-email`, { email, code });
  }

  resendVerification(email: string): Observable<void> {
    return this.http.post<void>(`${environment.authApiBase}/auth/resend-verification`, { email });
  }

  logout(): void {
    this._token.set(null);
    sessionStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }
}
