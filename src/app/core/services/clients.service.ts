import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client } from '../../features/dashboard/clients/models';



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

  getClients(): Observable<Client[]> {
    return this.httpClient.get<Client[]>(`${this.apiBaseURL}/api/clients`,{ 
        headers: this.getAuthHeaders() 
      })
  }

  getClientById(id: string): Observable<Client> {
    return this.httpClient.get<Client>(
      `${this.apiBaseURL}/api/clients/${id}`,
      { headers: this.getAuthHeaders() }
    )
  }

  createClient(data: Omit<Client, '_id'>): Observable<Client> {
    return this.httpClient.post<Client>(
      `${this.apiBaseURL}/api/clients`,
      data,
      { headers: this.getAuthHeaders() }
    )
  }

  updateClient(id: string, update: Partial<Client>): Observable<Client> {
    return this.httpClient.put<Client>(
      `${this.apiBaseURL}/api/clients/${id}`,
      update,
      { headers: this.getAuthHeaders() }
    )
  }

  deleteClient(_id: string): Observable<void> {
    return this.httpClient.delete<void>(
      `${this.apiBaseURL}/api/clients/${_id}`,
      { headers: this.getAuthHeaders() }
    )
  }

  searchClients(query: string): Observable<Client[]> {
    return this.httpClient.get<Client[]>(
      `${this.apiBaseURL}/api/clients`,
      { 
        params: new HttpParams().set('search', query),
        headers: this.getAuthHeaders() 
      }
    )
  }
}
