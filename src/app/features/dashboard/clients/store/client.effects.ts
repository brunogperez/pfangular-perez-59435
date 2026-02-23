import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  map,
  mergeMap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { ClientActions } from './client.actions';
import { ClientsService } from '../../../../core/services/clients.service';
import { Action } from '@ngrx/store';
import { NotificationService } from '../../../../core/services/notification.service';

@Injectable()
export class ClientEffects {
  loadClients$: Actions<Action<string>>;
  loadClientById$: Actions<Action<string>>;
  loadClientsAfterUpdate$: Actions<Action<string>>;
  createClient$: Actions<Action<string>>;
  updateClient$: Actions<Action<string>>;
  deleteClient$: Actions<Action<string>>;

  constructor(
    private actions$: Actions,
    private clientsService: ClientsService,
    private notificationService: NotificationService,
  ) {
    this.loadClients$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ClientActions.loadClients),
        mergeMap(() =>
          this.clientsService.getClients().pipe(
            map((clients) => {
              return ClientActions.loadClientsSuccess({ clients });
            }),
            catchError((error) => {
              this.notificationService.showError('No se pudo cargar la lista de clientes.');
              return of(ClientActions.loadClientsFailure({ error: error.message }));
            })
          )
        )
      );
    });

    this.loadClientById$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ClientActions.loadClientById),
        mergeMap(({ id }) =>
          this.clientsService.getClientById(id).pipe(
            map((client) => {
              return ClientActions.loadClientByIdSuccess({ client });
            }),
            catchError((error) => {
              this.notificationService.showError('No se pudo cargar el cliente.');
              return of(ClientActions.loadClientByIdFailure({ error: error.message }));
            })
          )
        )
      );
    });

    this.loadClientsAfterUpdate$ = createEffect(() =>
      this.actions$.pipe(
        ofType(
          ClientActions.createClientSuccess,
          ClientActions.updateClientSuccess,
          ClientActions.deleteClientSuccess
        ),
        map(() => ClientActions.loadClients())
      )
    );

    this.createClient$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ClientActions.createClient),
        mergeMap(({ client }) =>
          this.clientsService.createClient(client).pipe(
            map((createdClient) => {
              this.notificationService.showSuccess('Cliente creado exitosamente.');
              return ClientActions.createClientSuccess({ client: createdClient });
            }),
            catchError((error) => {
              this.notificationService.showError('No se pudo crear el cliente.');
              return of(ClientActions.createClientFailure({ error: error.message }));
            })
          )
        )
      )
    );

    this.updateClient$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ClientActions.updateClient),
        mergeMap(({ id, update }) =>
          this.clientsService.updateClient(id, update).pipe(
            map((updatedClient) => {
              this.notificationService.showSuccess('Cliente actualizado exitosamente.');
              return ClientActions.updateClientSuccess({ client: updatedClient });
            }),
            catchError((error) => {
              this.notificationService.showError('No se pudo actualizar el cliente.');
              return of(ClientActions.updateClientFailure({ error: error.message }));
            })
          )
        )
      )
    );

    this.deleteClient$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ClientActions.deleteClient),
        mergeMap(({ id }) =>
          this.clientsService.deleteClient(id).pipe(
            map(() => {
              this.notificationService.showSuccess('El cliente ha sido eliminado correctamente.', '¡Eliminado!');
              return ClientActions.deleteClientSuccess({ id });
            }),
            catchError((error) => {
              this.notificationService.showError('No se pudo eliminar el cliente.');
              return of(ClientActions.deleteClientFailure({ error: error.message }));
            })
          )
        )
      )
    );
  }
}
