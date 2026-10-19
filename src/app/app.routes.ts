import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';
import { clienteGuard } from './core/guards/cliente-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./features/catalog/catalog-list/catalog-list').then((m) => m.CatalogList),
  },
  {
    path: 'catalogo/:id',
    loadComponent: () =>
      import('./features/catalog/catalog-detail/catalog-detail').then((m) => m.CatalogDetail),
  },
  {
    path: 'catalogo/:id/apartar',
    loadComponent: () => import('./features/booking/booking').then((m) => m.Booking),
    canActivate: [clienteGuard],
  },
  {
    path: 'mi-cuenta',
    loadComponent: () => import('./features/account/account').then((m) => m.Account),
    canActivate: [clienteGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-panel/admin-panel').then((m) => m.AdminPanel),
    canActivate: [adminGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
