import { Injectable } from '@angular/core';
import { AuthData } from '../../features/auth/models';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { User } from '../../features/dashboard/users/models';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authUser$ = new BehaviorSubject<null | User>(null);
  public authUser$ = this._authUser$.asObservable();

  private apiURL = environment.apiBaseURL;

  constructor(private router: Router, private httpClient: HttpClient) {}

  private handleAuth(users: User[]): User | null {
    if (!!users[0]) {
      this._authUser$.next(users[0]);
      localStorage.setItem('token', users[0].token);
      return users[0];
    } else {
      return null;
    }
  }



  login(data: AuthData): Observable<User> {
    return (
      this.httpClient
        .get<User[]>(`${this.apiURL}/users?email=${data.email}`)
        //Elimine la password de la url para no exponerla 
        .pipe(
          map((users) => {
            // Solo pasa el usuario si tanto el email como la contraseña coinciden
            const user = users.find((user) => user.password === data.password);
            return this.handleAuth(user ? [user] : []);
          }),
          map((user) => {
            if (user) {
              return user;
            } else {
              throw new Error('Los datos son inválidos');
            }
          })
        )
    );
  }

  logout() {
    this._authUser$.next(null);
    localStorage.removeItem('token');
    this.router.navigate(['auth', 'login']);
  }

  /*   verifyToken(): Observable<boolean> {
    return this.httpClient
      .get<User[]>(
        `${this.apiURL}/users?token=${localStorage.getItem('token')}`
      )
      .pipe(
        map((users) => {
          const user = this.handleAuth(users);
          return !!user;
        })
      );
  } */

  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(false); // Retorna false si no hay token
    }

    return this.httpClient
      .get<User[]>(`${this.apiURL}/users?token=${token}`)
      .pipe(
        map((users) => {
          const user = this.handleAuth(users);
          return !!user;
        }),
        catchError(() => of(false)) // Retorna false si ocurre algún error
      );
  }

  isAdmin(): Observable<boolean> {
    return this.authUser$.pipe(map((user) => !!user && user.role === 'admin'));
  }
}
