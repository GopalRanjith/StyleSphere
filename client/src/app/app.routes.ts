import { inject } from '@angular/core';
import { Routes, Router, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'men',
    canActivate: [authGuard],
    data: { gender: 'men' },
    loadComponent: () => import('./pages/catalogue/catalogue').then(m => m.CatalogueComponent)
  },
  {
    path: 'women',
    canActivate: [authGuard],
    data: { gender: 'women' },
    loadComponent: () => import('./pages/catalogue/catalogue').then(m => m.CatalogueComponent)
  },
  {
    path: 'product/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/orders/orders').then(m => m.OrdersComponent)
  },
  {
    path: 'ai-recommendations',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/ai-recommendations/ai-recommendations').then(m => m.AiRecommendationsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
