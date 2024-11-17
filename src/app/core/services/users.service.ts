import { Injectable } from '@angular/core';
import { concatMap, delay, map, Observable, of } from 'rxjs';
import { User } from '../../features/dashboard/users/models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { generateRandomString } from '../../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  createUser(data: Omit<User, 'id'>): Observable<User> {
    return this.httpClient.post<User>(`${this.apiBaseURL}/users`, {
      ...data,
      createdAt: new Date().toISOString(),
      token: generateRandomString(15),
    });
  }

  getUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.apiBaseURL}/users`);
  }

  getUserById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.apiBaseURL}/users/${id}`);
  }

  updateUserById(id: string, update: Partial<User>) {
    return this.httpClient
      .patch<User>(`${this.apiBaseURL}/users/${id}`, update)
      .pipe(concatMap(() => this.getUsers()));
  }

  removeUserById(id: string): Observable<User[]> {
    return this.httpClient
      .delete<User>(`${this.apiBaseURL}/users/${id}`)
      .pipe(concatMap(() => this.getUsers()));
  }
}
