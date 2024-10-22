import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { User } from '../../features/dashboard/users/models';

let DATABASE: User[] = [
  {
    id: 'a1b2',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    birthdate: new Date('1985-06-15'),
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'c3d4',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    birthdate: new Date('1992-11-23'),
    createdAt: new Date('2023-01-02'),
  },
  {
    id: 'e5f6',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@example.com',
    birthdate: new Date('1978-04-30'),
    createdAt: new Date('2023-01-03'),
  },
  {
    id: 'g7h8',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    birthdate: new Date('1995-07-12'),
    createdAt: new Date('2023-01-04'),
  },
  {
    id: 'i9j0',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@example.com',
    birthdate: new Date('1980-09-05'),
    createdAt: new Date('2023-01-05'),
  },
  {
    id: 'k1l2',
    firstName: 'Jessica',
    lastName: 'Garcia',
    email: 'jessica.garcia@example.com',
    birthdate: new Date('1988-02-17'),
    createdAt: new Date('2023-01-06'),
  },
  {
    id: 'm3n4',
    firstName: 'Chris',
    lastName: 'Martinez',
    email: 'chris.martinez@example.com',
    birthdate: new Date('1972-03-21'),
    createdAt: new Date('2023-01-07'),
  },
];

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor() {}

  getUsers(): Observable<User[]> {
    return new Observable((observer) => {
      setInterval(() => {
        observer.next(DATABASE);

        observer.complete();
      }, 1000);
    });
  }

  getUserById(id: string): Observable<User | undefined> {
    return this.getUsers().pipe(map((user) => user.find((u) => u.id === id)));
  }

  updateUserById(id: string, update: Partial<User>) {
    DATABASE = DATABASE.map((user) =>
      user.id === id ? { ...user, ...update } : user
    );
    return new Observable<User[]>((observer) => {
      observer.next(DATABASE);
      observer.complete();
    });
  }

  removeUserById(id: string): Observable<User[]> {
    DATABASE = DATABASE.filter((user) => user.id != id);
    return of(DATABASE).pipe(delay(500));
  }
}
