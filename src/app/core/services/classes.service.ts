import { Injectable } from '@angular/core';
import { Class } from '../../features/dashboard/classes/models';
import { generateRandomString } from '../../shared/utils';
import { Observable, of } from 'rxjs';

export let MY_DATABASE: Class[] = [
  {
    id: generateRandomString(6),
    name: 'PS5',
    categoryId: '1j23j12',
  },
];

@Injectable({ providedIn: 'root' })
export class ClassesService {
    
  getClasses(): Observable<Class[]> {
    return of([...MY_DATABASE]);
  }

  deleteById(id: string): Observable<Class[]> {
    MY_DATABASE = MY_DATABASE.filter((e) => e.id !== id);
    return this.getClasses();
  }

  createClass(data: Omit<Class, 'id'>): Observable<Class[]> {
    MY_DATABASE.push({
      ...data,
      id: generateRandomString(6),
    });
    return this.getClasses();
  }
}
