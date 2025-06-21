import { Injectable } from '@angular/core';
import { concatMap, delay, map, Observable, of } from 'rxjs';
import { User } from '../../features/dashboard/users/models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { generateRandomString } from '../../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  createUser(data: Omit<User, 'id'>): Observable<User> {
    return this.httpClient.post<User>(`${this.apiBaseURL}/api/users`, {
      ...data,
      createdAt: new Date().toISOString(),
      token: generateRandomString(15),
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.apiBaseURL}/api/users`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.apiBaseURL}/api/users/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUserById(id: string, update: Partial<User>) {
    return this.httpClient
      .patch<User>(`${this.apiBaseURL}/api/users/${id}`, update, {
        headers: this.getAuthHeaders()
      })
      .pipe(concatMap(() => this.getUsers()));
  }

  removeUserById(id: string): Observable<User[]> {
    return this.httpClient
      .delete<User>(`${this.apiBaseURL}/api/users/${id}`, {
        headers: this.getAuthHeaders()
      })
      .pipe(concatMap(() => this.getUsers()));
  }
}
