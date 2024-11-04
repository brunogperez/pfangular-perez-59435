import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { generateRandomString } from '../../shared/utils';
import { map, Observable } from 'rxjs';
import { Inscription } from '../../features/dashboard/inscriptions/models';
import { environment } from '../../../environments/environment';
import { Student } from '../../features/dashboard/students/models';

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  getInscriptions(): Observable<Inscription[]> {
    return this.httpClient.get<Inscription[]>(
      `${this.apiBaseURL}/inscriptions`
    );
  }

  /*   deleteById(id: string): Observable<Inscription[]> {
    return this.httpClient
      .delete<Inscription>(`${this.apiBaseURL}/in/${id}`)
      .pipe(concatMap(() => this.getInscriptions()));
  } */

  createInscription(data: Omit<Inscription, 'id'>): Observable<Inscription> {
    return this.httpClient.post<Inscription>(
      `${this.apiBaseURL}/inscriptions`,
      {
        ...data,
        id: generateRandomString(4),
      }
    );
  }

  searchStudents(name: string): Observable<Student[]> {
    const APISEARCH = `${this.apiBaseURL}/students?name=${name}`;
    return this.httpClient
      .get<Student[]>(APISEARCH)
      .pipe(
        map((students: Student[]) =>
          students.filter((student) =>
            student.firstName.toLowerCase().includes(name.toLowerCase())
          )
        )
      );
  }
}
