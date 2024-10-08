import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { User } from './models';

const ELEMENT_DATA: User[] = [
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

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'birthdate',
    'createdAt',
    'actions',
  ];

  dataSource = ELEMENT_DATA;

  constructor(private matDialog: MatDialog) {}

  onDelete(id: string) {
    this.dataSource = this.dataSource.filter((user) => user.id !== id);
  }

  openDialog(editUser?: User): void {
    this.matDialog
      .open(UserDialogComponent, { data: { editUser } })
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (!!res) {
            if (editUser) {
              this.dataSource = this.dataSource.map((user) =>
                user.id === editUser.id ? { ...user, ...res } : user
              );
            } else {
              this.dataSource = [...this.dataSource, res];
            }
          }
        },
      });
  }
}
