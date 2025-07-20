import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { generateRandomString } from '../../shared/utils';
import { concatMap, map, Observable } from 'rxjs';
import { Inscription } from '../../features/dashboard/inscriptions/models';
import { environment } from '../../../environments/environment';
import { Client } from '../../features/dashboard/clients/models';

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  getInscriptions(): Observable<Inscription[]> {
    return this.httpClient.get<Inscription[]>(
      `${this.apiBaseURL}/api/inscriptions` 
    );
  }
  getInscriptionsById(clientId: string): Observable<Inscription[]> {
    const APISEARCH = `${this.apiBaseURL}/api/inscriptions?clientId=${clientId}`;
    return this.httpClient
      .get<Inscription[]>(APISEARCH)
      .pipe(map((res: Inscription[]) => res));
  }
  getInscriptionsByProduct(productId: string): Observable<Inscription[]> {
    const APISEARCH = `${this.apiBaseURL}/api/inscriptions?productId=${productId}`;
    return this.httpClient
      .get<Inscription[]>(APISEARCH)
      .pipe(map((res: Inscription[]) => res));
  }
  getInscriptionsByProductAndClient(
    productId: string,
    clientId: string
  ): Observable<Inscription[]> {
    const APISEARCH = `${this.apiBaseURL}/api/inscriptions?clientId=${clientId}&productId=${productId}`;
    return this.httpClient
      .get<Inscription[]>(APISEARCH)
      .pipe(map((res: Inscription[]) => res));
  }

  createInscription(
    data: Omit<Inscription, 'id' | 'client' | 'product'>
  ): Observable<Inscription> {
    return this.httpClient.post<Inscription>(
      `${this.apiBaseURL}/api/inscriptions`,
      {
        ...data,
        id: generateRandomString(8),
      }
    );
  }

  deleteInscription(id: string): Observable<Inscription[]> {
    return this.httpClient
      .delete<Inscription>(`${this.apiBaseURL}/api/inscriptions/${id}`)
      .pipe(concatMap(() => this.getInscriptions()));
  }

  searchClients(name: string): Observable<Client[]> {
    const APISEARCH = `${this.apiBaseURL}/api/clients?name=${name}`;
    return this.httpClient
      .get<Client[]>(APISEARCH)
      .pipe(
        map((clients: Client[]) =>
          clients.filter((client) =>
            client.firstName.toLowerCase().includes(name.toLowerCase())
          )
        )
      );
  }

  isClientEnrolled(clientId: string, productId: string): Observable<boolean> {
    return this.httpClient
      .get<Inscription[]>(
        `${this.apiBaseURL}/api/inscriptions?clientId=${clientId}&productId=${productId}`
      )
      .pipe(map((inscriptions) => inscriptions.length > 0));
  }
}
