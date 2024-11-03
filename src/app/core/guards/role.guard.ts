import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAdmin().pipe(
    map((isAdmin) => {
      if (!isAdmin) {
        router.navigate(['dashboard', 'home']);
      }
      return isAdmin;
    })
  );
};
