import { Injectable } from '@angular/core';
import { concatMap, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { generateRandomString } from '../../shared/utils';
import { Client } from '../../features/dashboard/clients/models';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  createClient(data: Omit<Client, 'id'>): Observable<Client> {
    return this.httpClient.post<Client>(`${this.apiBaseURL}/clients`, {
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  getClients(): Observable<Client[]> {
    return this.httpClient.get<Client[]>(`${this.apiBaseURL}/clients`);
  }

  getClientById(id: string): Observable<Client | undefined> {
    return this.httpClient.get<Client>(
      `${this.apiBaseURL}/clients/${id}?_embed=inscriptions`
    );
  }

  searchClients(name: string): Observable<Client[]> {
    const APISEARCH = `${this.apiBaseURL}/clients?firstName=${name}`;
    return this.httpClient
      .get<Client[]>(APISEARCH)
      .pipe(map((res: Client[]) => res));
  }

  updateClientById(id: string, update: Partial<Client>) {
    return this.httpClient
      .patch<Client>(`${this.apiBaseURL}/clients/${id}`, update)
      .pipe(concatMap(() => this.getClients()));
  }

  removeClientById(id: string): Observable<Client[]> {
    return this.httpClient
      .delete<Client>(`${this.apiBaseURL}/clients/${id}`)
      .pipe(concatMap(() => this.getClients()));
  }
}
