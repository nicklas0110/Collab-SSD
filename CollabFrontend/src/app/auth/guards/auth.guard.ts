import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const publicRoutes = ['/login', '/register', '/forgot-password'];

  if (authService.isLoggedIn()) {
    if (publicRoutes.includes(state.url)) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  } else {
    if (!publicRoutes.includes(state.url)) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  }
};
