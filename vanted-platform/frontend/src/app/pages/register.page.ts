import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell"><section class="auth-card">
      <p class="eyebrow">VANTED</p><h1>Create account</h1><p class="muted">Start using Vanted services.</p>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>First name<input formControlName="firstName" autocomplete="given-name"></label>
        <label>Last name<input formControlName="lastName" autocomplete="family-name"></label>
        <label>Email<input type="email" formControlName="email" autocomplete="email"></label>
        <label>Password<input type="password" formControlName="password" autocomplete="new-password"></label>
        @if (error()) { <p class="error">{{ error() }}</p> }
        <button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Creating…' : 'Create account' }}</button>
      </form>
      <p class="muted">Already registered? <a routerLink="/login">Sign in</a></p>
    </section></main>
  `,
  styles: [`
    .auth-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:#07111f}.auth-card{width:min(440px,100%);background:#0d1b2a;color:#eef5ff;border:1px solid #20344a;border-radius:20px;padding:32px}.eyebrow{letter-spacing:.22em;font-weight:800;color:#9ec5ff}.muted{color:#a9bbce}.auth-card form{display:grid;gap:14px;margin:24px 0}.auth-card label{display:grid;gap:8px;font-weight:600}.auth-card input{padding:12px 14px;border-radius:10px;border:1px solid #31506e;background:#091523;color:#fff}.auth-card button{padding:13px;border:0;border-radius:10px;background:#3f8cff;color:#fff;font-weight:800}.auth-card button:disabled{opacity:.55}.error{color:#ff9b9b}a{color:#9ec5ff}
  `]
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = signal(false); readonly error = signal('');
  readonly form = this.fb.nonNullable.group({ firstName:['',Validators.required], lastName:['',Validators.required], email:['',[Validators.required,Validators.email]], password:['',[Validators.required,Validators.minLength(8)]] });
  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    const v = this.form.getRawValue();
    this.auth.register(v.email,v.password,v.firstName,v.lastName).subscribe({
      next:()=>this.router.navigateByUrl('/services'),
      error:err=>{this.loading.set(false);this.error.set(err?.error?.message ?? 'Unable to create account');}
    });
  }
}
