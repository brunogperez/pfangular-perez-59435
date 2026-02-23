import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientsDialogComponent } from './client-dialog/client-dialog.component';
import { Client } from './models';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable, startWith } from 'rxjs';
import { selectorClients } from './store/client.selectors';
import { ClientActions } from './store/client.actions';
import { User } from '../users/models';
import { selectAuthUser } from '../../../store/selectors/auth.selectors';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { UserFullNamePipe } from '../../../shared/pipes/user-full-name.pipe';
import { AgePipe } from '../../../shared/pipes/age.pipe';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    UserFullNamePipe,
    AgePipe,
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'birthdate',
    'createdAt',
    'actions',
  ];
  user$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  clients$: Observable<Client[]>;
  isLoading = false;

  constructor(
    private matDialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private notificationService: NotificationService,
  ) {
    this.user$ = this.store.select(selectAuthUser);
    this.isAdmin$ = this.user$.pipe(map((user) => user?.role === 'admin'));
    this.clients$ = this.store.select(selectorClients);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.store.dispatch(ClientActions.loadClients());
   
  }

  goToDetail(id: string): void {
    this.router.navigate([id, 'detail'], { relativeTo: this.activatedRoute });
  }

  openDialog(editClient?: Client): void {
    this.matDialog
      .open(ClientsDialogComponent, { data: { editClient } })
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (!!res) {
            if (editClient) {
              this.store.dispatch(
                ClientActions.updateClient({
                  id: editClient._id,
                  update: res,
                })
              );
            } else {
              this.store.dispatch(
                ClientActions.createClient({ client: res })
              );
            }
          }
        },
      });
  }

  async onDelete(id: string) {
    if (await this.notificationService.confirmDelete('este cliente')) {
      this.store.dispatch(ClientActions.deleteClient({ id }));
    }
  }
}
