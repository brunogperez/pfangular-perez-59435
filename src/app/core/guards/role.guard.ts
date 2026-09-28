import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';
import { UserRole } from '../models';
import { selectAuthUser } from '../../store/selectors/auth.selectors';

/**
 * Factory de guard por roles. El aislamiento real lo hace el backend (scope
 * server-side + 403); este guard es UX: evita que un role caiga en una pantalla
 * que igual le devolvería 403. Si el role no está permitido, redirige a home.
 *
 * Uso en rutas: `canActivate: [roleGuard(['admin'])]`
 */
export const roleGuard =
  (allowedRoles: UserRole[]): CanActivateFn =>
  () => {
    const store = inject(Store);
    const router = inject(Router);

    return store.select(selectAuthUser).pipe(
      take(1),
      map((user) =>
        user && allowedRoles.includes(user.role)
          ? true
          : router.createUrlTree(['dashboard', 'home'])
      )
    );
  };
