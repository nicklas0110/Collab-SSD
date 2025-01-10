import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { map } from 'rxjs';

export const adminGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.currentUser$.pipe(
    map(user => {
      if (user?.role === 'admin') {
        return true;
      }
      router.navigate(['/']);
      return false;
    })
  );
}; 