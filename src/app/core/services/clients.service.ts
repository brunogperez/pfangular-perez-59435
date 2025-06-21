import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client } from '../../features/dashboard/clients/models';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getClients(page: number = 1, limit: number = 10, search: string = ''): Observable<PaginatedResponse<Client>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.httpClient.get<PaginatedResponse<Client>>(
      `${this.apiBaseURL}/api/clients`,
      { 
        params,
        headers: this.getAuthHeaders() 
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getClientById(id: string): Observable<Client> {
    return this.httpClient.get<Client>(
      `${this.apiBaseURL}/api/clients/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  createClient(data: Omit<Client, '_id'>): Observable<Client> {
    return this.httpClient.post<Client>(
      `${this.apiBaseURL}/api/clients`,
      data,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateClient(id: string, update: Partial<Client>): Observable<Client> {
    return this.httpClient.put<Client>(
      `${this.apiBaseURL}/api/clients/${id}`,
      update,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteClient(id: string): Observable<void> {
    return this.httpClient.delete<void>(
      `${this.apiBaseURL}/api/clients/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  searchClients(query: string): Observable<Client[]> {
    return this.httpClient.get<Client[]>(
      `${this.apiBaseURL}/api/clients/search`,
      { 
        params: new HttpParams().set('q', query),
        headers: this.getAuthHeaders() 
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }
}
