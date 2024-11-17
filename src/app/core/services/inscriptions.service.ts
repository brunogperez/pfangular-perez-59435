import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { generateRandomString } from '../../shared/utils';
import { concatMap, map, Observable } from 'rxjs';
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
  getInscriptionsById(studentId: string): Observable<Inscription[]> {
    const APISEARCH = `${this.apiBaseURL}/inscriptions?studentId=${studentId}`;
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
  getInscriptionsByCourseAndStudent(
    courseId: string,
    studentId: string
  ): Observable<Inscription[]> {
    const APISEARCH = `${this.apiBaseURL}/inscriptions?studentId=${studentId}&courseId=${courseId}`;
    return this.httpClient
      .get<Inscription[]>(APISEARCH)
      .pipe(map((res: Inscription[]) => res));
  }

  createInscription(
    data: Omit<Inscription, 'id' | 'student' | 'course'>
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

  isStudentEnrolled(studentId: string, courseId: string): Observable<boolean> {
    return this.httpClient
      .get<Inscription[]>(
        `${this.apiBaseURL}/inscriptions?studentId=${studentId}&courseId=${courseId}`
      )
      .pipe(map((inscriptions) => inscriptions.length > 0));
  }
}
