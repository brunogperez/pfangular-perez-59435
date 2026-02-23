import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { User } from './models';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectorUsers } from './store/user.selectors';
import { UserActions } from './store/user.actions';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { UserFullNamePipe } from '../../../shared/pipes/user-full-name.pipe';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTableModule,
    UserFullNamePipe,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'createdAt',
    'role',
    'actions',
  ];
  users$: Observable<User[]>;
  isLoading = false;

  constructor(
    private matDialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private notificationService: NotificationService
  ) {
    this.users$ = this.store.select(selectorUsers);
  }

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());
  }

  goToDetail(id: string): void {
    this.router.navigate([id, 'detail'], { relativeTo: this.activatedRoute });
  }

  openDialog(editUser?: User): void {
    this.matDialog
      .open(UserDialogComponent, { data: { editUser } })
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (!!res) {
            if (editUser) {
              this.store.dispatch(
                UserActions.updateUser({ id: editUser._id, update: res })
              );
            } else {
              this.store.dispatch(UserActions.createUser({ user: res }));
            }
          }
        },
      });
  }

  async onDelete(id: string) {
    if (await this.notificationService.confirmDelete('este usuario')) {
      this.store.dispatch(UserActions.deleteUser({ id }));
    }
  }
}
