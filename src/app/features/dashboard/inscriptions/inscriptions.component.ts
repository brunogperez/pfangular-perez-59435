import { Component, OnInit } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  startWith,
  Subject,
} from 'rxjs';
import { Inscription } from './models';
import { Client } from '../clients/models';
import { MatDialog } from '@angular/material/dialog';
import { InscriptionDialogComponent } from './inscription-dialog/inscription-dialog.component';
import { Store } from '@ngrx/store';
import { InscriptionActions } from './store/inscription.actions';
import { selectorInscriptions } from './store/inscription.selectors';
import Swal from 'sweetalert2';
import { ClientActions } from '../clients/store/client.actions';
import { selectorClients } from '../clients/store/client.selectors';

@Component({
  selector: 'app-inscriptions',
  templateUrl: './inscriptions.component.html',
  styleUrl: './inscriptions.component.scss',
})
export class InscriptionsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'birthdate',
    'createdAt',
    'actions',
  ];

  searchTerm$ = new Subject<string>();
  clients$!: Observable<Client[]>;
  inscriptions$: Observable<Inscription[]>;

  constructor(private matDialog: MatDialog, private store: Store) {
    this.clients$ = this.store.select(selectorClients);
    this.inscriptions$ = this.store.select(selectorInscriptions);
  }

  ngOnInit(): void {
    this.store.dispatch(InscriptionActions.loadInscriptions());
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

  openDialog(inscription?: Inscription): void {
    this.matDialog.open(InscriptionDialogComponent, { data: { inscription } });
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
        this.store.dispatch(InscriptionActions.deleteInscription({ id }));
      }
    });
  }
}
