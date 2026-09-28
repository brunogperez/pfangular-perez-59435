import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthData, User } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiURL = environment.apiBaseURL;

  login(data: AuthData): Observable<User> {
    return this.http
      .post<User>(`${this.apiURL}/api/users/login`, data)
      .pipe(catchError((err) => this.translate(err)));
  }

  verifyToken(): Observable<User | null> {
    if (!localStorage.getItem('token')) return of(null);
    return this.http
      .get<User>(`${this.apiURL}/api/users/profile`)
      .pipe(catchError(() => of(null)));
  }

  private translate(err: HttpErrorResponse): never {
    if (err.status === 401 || err.status === 400) {
      throw new Error(err.error?.error || 'Credenciales inválidas');
    }
    if (err.status === 0) {
      throw new Error('No se pudo conectar con el servidor');
    }
    if (err.status === 404) {
      throw new Error('Endpoint no encontrado');
    }
    throw new Error(err.error?.error || 'Error interno del servidor');
  }
}
