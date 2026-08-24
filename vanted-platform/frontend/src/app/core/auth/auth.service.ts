import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, tap, throwError } from 'rxjs';
import { AuthResponse, User } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'vanted.accessToken';
  private readonly userSignal = signal<User | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly authenticated = computed(() => !!this.userSignal());

  constructor() {
    const token = sessionStorage.getItem(this.tokenKey);
    if (token) this.loadMe().subscribe({ error: () => this.clearSession() });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }, { withCredentials: true })
      .pipe(tap(response => this.acceptSession(response)));
  }

  register(email: string, password: string, firstName: string, lastName: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', { email, password, firstName, lastName }, { withCredentials: true })
      .pipe(tap(response => this.acceptSession(response)));
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/refresh', {}, { withCredentials: true })
      .pipe(tap(response => this.acceptSession(response)), shareReplay(1));
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}, { withCredentials: true }).pipe(tap(() => this.clearSession()));
  }

  loadMe(): Observable<User> {
    return this.http.get<User>('/api/auth/me', { withCredentials: true }).pipe(tap(user => this.userSignal.set(user)));
  }

  accessToken(): string | null { return sessionStorage.getItem(this.tokenKey); }

  clearSession(): void {
    sessionStorage.removeItem(this.tokenKey);
    this.userSignal.set(null);
  }

  private acceptSession(response: AuthResponse): void {
    sessionStorage.setItem(this.tokenKey, response.accessToken);
    this.userSignal.set(response.user);
  }
}
