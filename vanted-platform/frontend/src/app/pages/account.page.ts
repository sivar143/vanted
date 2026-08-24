import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  standalone: true,
  template: `
    <main class="account">
      <span class="eyebrow">VANTED ACCOUNT</span>
      @if (auth.user(); as user) {
        <h1>Hello {{ user.firstName }}</h1>
        <p>{{ user.email }} · {{ user.role }}</p>
      }
      <button (click)="logout()">Sign out</button>
    </main>
  `,
  styles: [`.account{min-height:100vh;padding:64px clamp(20px,7vw,100px);background:#07111f;color:#eef5ff}.eyebrow{letter-spacing:.2em;color:#9ec5ff}.account p{color:#a9bbce}.account button{margin-top:24px;padding:12px 18px;border:0;border-radius:10px;background:#3f8cff;color:#fff;font-weight:700}`]
})
export class AccountPage {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  logout(): void { this.auth.logout().subscribe({ next: () => this.router.navigateByUrl('/home'), error: () => { this.auth.clearSession(); this.router.navigateByUrl('/home'); } }); }
}
