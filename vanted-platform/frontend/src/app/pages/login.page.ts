import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card">
        <p class="eyebrow">VANTED</p>
        <h1>Welcome back</h1>
        <p class="muted">Sign in to manage your services and bookings.</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Email<input type="email" formControlName="email" autocomplete="email"></label>
          <label>Password<input type="password" formControlName="password" autocomplete="current-password"></label>
          @if (error()) { <p class="error">{{ error() }}</p> }
          <button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Signing in…' : 'Sign in' }}</button>
        </form>
        <p class="muted">New to Vanted? <a routerLink="/register">Create an account</a></p>
      </section>
    </main>
  `,
  styles: [`
    .auth-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:#07111f}.auth-card{width:min(440px,100%);background:#0d1b2a;color:#eef5ff;border:1px solid #20344a;border-radius:20px;padding:32px;box-shadow:0 24px 60px #0005}.eyebrow{letter-spacing:.22em;font-weight:800;color:#9ec5ff}.muted{color:#a9bbce}.auth-card form{display:grid;gap:16px;margin:24px 0}.auth-card label{display:grid;gap:8px;font-weight:600}.auth-card input{padding:12px 14px;border-radius:10px;border:1px solid #31506e;background:#091523;color:#fff}.auth-card button{padding:13px;border:0;border-radius:10px;background:#3f8cff;color:#fff;font-weight:800;cursor:pointer}.auth-card button:disabled{opacity:.55;cursor:not-allowed}.error{color:#ff9b9b}a{color:#9ec5ff}
  `]
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl('/services'),
      error: err => { this.loading.set(false); this.error.set(err?.error?.message ?? 'Unable to sign in'); }
    });
  }
}
