import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadComponent: () => import('./pages/home.page').then(m => m.HomePage) },
  { path: 'services', loadComponent: () => import('./pages/services.page').then(m => m.ServicesPage) },
  { path: 'login', loadComponent: () => import('./pages/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register.page').then(m => m.RegisterPage) },
  { path: 'account', canActivate: [authGuard], loadComponent: () => import('./pages/account.page').then(m => m.AccountPage) },
  { path: '**', redirectTo: 'home' }
];
