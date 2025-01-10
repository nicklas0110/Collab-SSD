import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { map } from 'rxjs';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return authService.currentUser$.pipe(
      map(user => {
        if (!user || !allowedRoles.includes(user.role)) {
          router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  };
};
