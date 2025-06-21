// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AuthData } from '../../features/auth/models';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { User } from '../../features/dashboard/users/models';
import { Router } from '@angular/router';
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


  login(data: AuthData): Observable<User> {
    return this.httpClient
      .post<User>(`${this.apiURL}/users/login`, {
        email: data.email,
        password: data.password
      })
      .pipe(
        tap(user => {
          localStorage.setItem('token', user.token);
          this.store.dispatch(AuthActions.setAuthenticatedUser({ user }));
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en el login:', error);
          
          if (error.status === 400) {
            throw new Error('Credenciales inválidas');
          }
          if (error.status === 0) {
            throw new Error('No se pudo conectar con el servidor');
          }
          if (error.error?.error) {
            throw new Error(error.error.error);
          }
          
          throw new Error('Error interno del servidor');
        })
      );
  }

  logout(): void {
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
      .get<{ valid: boolean }>(`${this.apiURL}/users/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .pipe(
        map(response => response.valid),
        catchError(() => of(false))
      );

  }

  isAdmin(): Observable<boolean> {
    return this.authUser$.pipe(
      map((user) => !!user && user.role === 'admin')
    );
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}