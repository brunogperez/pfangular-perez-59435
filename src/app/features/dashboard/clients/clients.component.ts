import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientsDialogComponent } from './client-dialog/client-dialog.component';
import { Client } from './models';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable, startWith } from 'rxjs';
import { selectorClients } from './store/client.selectors';
import { ClientActions } from './store/client.actions';
import { User } from '../users/models';
import { selectAuthUser } from '../../../store/selectors/auth.selectors';

@Component({
  selector: 'app-clients',
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

  onDelete(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.store.dispatch(ClientActions.deleteClient({ id }));
      }
    });
  }
}
