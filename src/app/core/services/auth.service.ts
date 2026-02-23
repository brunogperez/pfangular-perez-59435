import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs';
import { AuthData } from '../../features/auth/models';
import { User } from '../../features/dashboard/users/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  login(data: AuthData): Observable<User> {
    return this.httpClient
      .post<User>(`${this.apiURL}/api/users/login`, {
        email: data.email,
        password: data.password,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400) {
            throw new Error(error.error?.error || 'Credenciales invalidas');
          }
          if (error.status === 0) {
            throw new Error('No se pudo conectar con el servidor');
          }
          if (error.status === 404) {
            throw new Error('Endpoint no encontrado - Verifica la URL del backend');
          }
          if (error.error?.error) {
            throw new Error(error.error.error);
          }
          throw new Error('Error interno del servidor');
        })
      );
  }

  verifyToken(): Observable<User | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    return this.httpClient
      .get<User>(`${this.apiURL}/api/users/profile`)
      .pipe(catchError(() => of(null)));
  }
}
