import { Injectable } from '@angular/core';
import { concatMap, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { generateRandomString } from '../../shared/utils';
import { Student } from '../../features/dashboard/students/models';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  createStudent(data: Omit<Student, 'id'>): Observable<Student> {
    return this.httpClient.post<Student>(`${this.apiBaseURL}/students`, {
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  getStudents(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(`${this.apiBaseURL}/students`);
  }

  getStudentById(id: string): Observable<Student | undefined> {
    return this.httpClient.get<Student>(
      `${this.apiBaseURL}/students/${id}?_embed=inscriptions`
    );
  }

  searchStudents(name: string): Observable<Student[]> {
    const APISEARCH = `${this.apiBaseURL}/students?firstName=${name}`;
    return this.httpClient
      .get<Student[]>(APISEARCH)
      .pipe(map((res: Student[]) => res));
  }

  updateStudentById(id: string, update: Partial<Student>) {
    return this.httpClient
      .patch<Student>(`${this.apiBaseURL}/students/${id}`, update)
      .pipe(concatMap(() => this.getStudents()));
  }

  removeStudentById(id: string): Observable<Student[]> {
    return this.httpClient
      .delete<Student>(`${this.apiBaseURL}/students/${id}`)
      .pipe(concatMap(() => this.getStudents()));
  }
}
