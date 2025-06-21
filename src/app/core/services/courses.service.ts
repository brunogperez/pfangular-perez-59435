import { Injectable } from '@angular/core';
import { concatMap, Observable } from 'rxjs';
import { Course } from '../../features/dashboard/courses/models/index';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private httpClient: HttpClient) {}

  createCourse(data: Omit<Course, 'id'>): Observable<Course> {
    return this.httpClient.post<Course>(`${this.apiBaseURL}/api/courses`, data);
  }

  getCourses(): Observable<Course[]> {
    return this.httpClient.get<Course[]>(`${this.apiBaseURL}/api/courses`);
  }

  getCourseById(id: string): Observable<Course> {
    const result = this.httpClient.get<Course>(
      `${this.apiBaseURL}/api/courses/${id}`
    );
    return result;
  }

  updateCourseById(id: string, update: Partial<Course>) {
    return this.httpClient
      .patch<Course>(`${this.apiBaseURL}/api/courses/${id}`, update)
      .pipe(concatMap(() => this.getCourses()));
  }

  removeCourseById(id: string): Observable<Course[]> {
    return this.httpClient
      .delete<Course>(`${this.apiBaseURL}/api/courses/${id}`)
      .pipe(concatMap(() => this.getCourses()));
  }
}
