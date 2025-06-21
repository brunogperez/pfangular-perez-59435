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
      `${this.apiBaseURL}/inscriptions` 
    );
  }
  getInscriptionsById(clientId: string): Observable<Inscription[]> {
    const APISEARCH = `${this.apiBaseURL}/inscriptions?clientId=${clientId}`;
    return this.httpClient
      .get<Inscription[]>(APISEARCH)
      .pipe(map((res: Inscription[]) => res));
  }
  getInscriptionsByCourse(courseId: string): Observable<Inscription[]> {
    const APISEARCH = `${this.apiBaseURL}/inscriptions?courseId=${courseId}`;
    return this.httpClient
      .get<Inscription[]>(APISEARCH)
      .pipe(map((res: Inscription[]) => res));
  }
  getInscriptionsByCourseAndClient(
    courseId: string,
    clientId: string
  ): Observable<Inscription[]> {
    const APISEARCH = `${this.apiBaseURL}/inscriptions?clientId=${clientId}&courseId=${courseId}`;
    return this.httpClient
      .get<Inscription[]>(APISEARCH)
      .pipe(map((res: Inscription[]) => res));
  }

  createInscription(
    data: Omit<Inscription, 'id' | 'client' | 'course'>
  ): Observable<Inscription> {
    return this.httpClient.post<Inscription>(
      `${this.apiBaseURL}/inscriptions`,
      {
        ...data,
        id: generateRandomString(8),
      }
    );
  }

  deleteInscription(id: string): Observable<Inscription[]> {
    return this.httpClient
      .delete<Inscription>(`${this.apiBaseURL}/inscriptions/${id}`)
      .pipe(concatMap(() => this.getInscriptions()));
  }

  searchClients(name: string): Observable<Client[]> {
    const APISEARCH = `${this.apiBaseURL}/clients?name=${name}`;
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

  isClientEnrolled(clientId: string, courseId: string): Observable<boolean> {
    return this.httpClient
      .get<Inscription[]>(
        `${this.apiBaseURL}/inscriptions?clientId=${clientId}&courseId=${courseId}`
      )
      .pipe(map((inscriptions) => inscriptions.length > 0));
  }
}
