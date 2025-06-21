import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientsDialogComponent } from './client-dialog/client-dialog.component';
import { Client } from './models';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsService } from '../../../core/services/clients.service';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { selectorClients } from './store/client.selectors';
import { ClientActions } from './store/client.actions';
import { User } from '../users/models';
import { selectAuthUser } from '../../../store/selectors/auth.selectors';
import { InscriptionService } from '../../../core/services/inscriptions.service';

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

  searchTerm$ = new Subject<string>();
  dataSource: Client[] = [];

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
  
    this.searchTerm$
      .pipe(startWith(''), debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.store.dispatch(ClientActions.searchClients({ term }));
      });
  }

  search(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    this.searchTerm$.next(element.value);
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
                  id: editClient.id,
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
