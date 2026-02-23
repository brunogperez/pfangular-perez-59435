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
import { ClientActions } from '../clients/store/client.actions';
import { selectorClients } from '../clients/store/client.selectors';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { UserFullNamePipe } from '../../../shared/pipes/user-full-name.pipe';
import { AgePipe } from '../../../shared/pipes/age.pipe';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-inscriptions',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTableModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    UserFullNamePipe,
    AgePipe,
  ],
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

  constructor(private matDialog: MatDialog, private store: Store, private notificationService: NotificationService) {
    this.clients$ = this.store.select(selectorClients);
    this.inscriptions$ = this.store.select(selectorInscriptions);
  }

  ngOnInit(): void {
    this.store.dispatch(InscriptionActions.loadInscriptions());
    this.searchTerm$
      .pipe(startWith(''), debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.store.dispatch(ClientActions.loadClients());
      });
  }

  search(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    this.searchTerm$.next(element.value);
  }

  openDialog(inscription?: Inscription): void {
    this.matDialog.open(InscriptionDialogComponent, { data: { inscription } });
  }

  async onDelete(id: string) {
    if (await this.notificationService.confirmDelete('esta inscripción')) {
      this.store.dispatch(InscriptionActions.deleteInscription({ id }));
    }
  }
}
