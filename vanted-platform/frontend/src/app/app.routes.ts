import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadComponent: () => import('./pages/home.page').then(m => m.HomePage) },
  { path: 'services', loadComponent: () => import('./pages/services.page').then(m => m.ServicesPage) },
  { path: '**', redirectTo: 'home' }
];
