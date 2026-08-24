import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'vanted-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="nav">
      <a class="brand" routerLink="/home">VANTED</a>
      <div class="links">
        <a routerLink="/services">Services</a>
        @if (auth.authenticated()) { <a routerLink="/account">Account</a> }
        @else { <a routerLink="/login">Sign in</a> }
      </div>
    </nav>
    <router-outlet />
  `,
  styles: [`.nav{position:fixed;top:0;left:0;right:0;z-index:20;display:flex;justify-content:space-between;align-items:center;padding:16px 28px;background:#07111ff2;border-bottom:1px solid #20344a;backdrop-filter:blur(12px)}.brand{color:#eef5ff;text-decoration:none;font-weight:900;letter-spacing:.18em}.links{display:flex;gap:20px}.links a{color:#b8c8d9;text-decoration:none}.links a:hover{color:#fff}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent { readonly auth = inject(AuthService); }
