import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthActions } from '../../store/actions/auth.actions';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const store = inject(Store);

  return authService.verifyToken().pipe(
    map((user) => {
      if (user) {
        store.dispatch(AuthActions.verifyTokenSuccess({ user }));
        return true;
      }
      return router.createUrlTree(['auth', 'login']);
    }),
    catchError(() => of(router.createUrlTree(['auth', 'login'])))
  );
};
