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
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload['sub'] as string;
    } catch {
      return null;
    }
  });

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBase}/auth/login`, { email, password })
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
    return this.http.post<RegisterResponse>(`${environment.apiBase}/auth/register`, {
      name,
      email,
      password,
      confirmPassword,
    });
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
