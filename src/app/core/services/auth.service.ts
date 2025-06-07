import { Injectable } from '@angular/core';
import { AuthData } from '../../features/auth/models';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../features/dashboard/users/models';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/actions/auth.actions';
import { selectAuthUser } from '../../store/selectors/auth.selectors';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public authUser$: Observable<User | null>;
  private apiURL = environment.apiBaseURL;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private store: Store
  ) {
    this.authUser$ = this.store.select(selectAuthUser);
  }

  private handleAuth(users: User[]): User | null {
    if (!!users[0]) {
      /*  this._authUser$.next(users[0]); */
      this.store.dispatch(AuthActions.setAuthenticatedUser({ user: users[0] }));
      localStorage.setItem('token', users[0].token);
      return users[0];
    } else {
      return null;
    }
  }

  login(data: AuthData): Observable<User> {
    // Primero obtenemos el usuario por email
    return this.httpClient
      .get<User[]>(`${this.apiURL}/users?email=${data.email}`)
      .pipe(
        map((users) => {
          // Buscamos el usuario que coincida con el email y contraseña
          const user = users.find((user) => user.password === data.password);
          
          if (!user) {
            throw new Error('Credenciales inválidas');
          }
          
          // Generamos un token (en producción, esto debería hacerse en el backend)
          const token = Math.random().toString(36).substring(2);
          const userWithToken = { ...user, token };
          
          // Actualizamos el usuario en el servidor con el nuevo token
          this.httpClient.put(`${this.apiURL}/users/${user.id}`, userWithToken).subscribe();
          
          // Guardamos el token y actualizamos el estado
          localStorage.setItem('token', token);
          this.store.dispatch(AuthActions.setAuthenticatedUser({ user: userWithToken }));
          
          return userWithToken;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en el login:', error);
          if (error.status === 404) {
            return of(null);
          }
          return of(null);
        }),
        map(user => {
          if (!user) {
            throw new Error('Credenciales inválidas');
          }
          return user;
        })
      );
  }

  logout() {
    this.store.dispatch(AuthActions.unsetAuthenticatedUser());
    localStorage.removeItem('token');
    this.router.navigate(['auth', 'login']);
  }

  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(false);
    }

    return this.httpClient
      .get<User[]>(`${this.apiURL}/users?token=${token}`)
      .pipe(
        map((users) => {
          const user = this.handleAuth(users);
          return !!user;
        }),
        catchError(() => of(false))
      );
  }

  isAdmin(): Observable<boolean> {
    return this.authUser$.pipe(map((user) => !!user && user.role === 'admin'));
  }
}
