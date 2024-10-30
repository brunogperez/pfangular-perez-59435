import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authUser$.pipe(
    map((authUser) =>
      authUser ? true : router.createUrlTree(['auth', 'login'])
    )
  );

  // !! la doble negación transforma un null en false
};
