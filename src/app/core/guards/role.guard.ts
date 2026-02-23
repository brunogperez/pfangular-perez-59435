import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { selectAuthUser } from '../../store/selectors/auth.selectors';

export const roleGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthUser).pipe(
    map((user) => {
      if (user && user.role === 'admin') {
        return true;
      }
      router.navigate(['dashboard', 'home']);
      return false;
    })
  );
};
