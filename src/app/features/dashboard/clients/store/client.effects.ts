import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  catchError,
  concatMap,
  distinctUntilChanged,
  map,
  mergeMap,
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { ClientActions } from './client.actions';
import { ClientsService } from '../../../../core/services/clients.service';
import { Action } from '@ngrx/store';
import Swal from 'sweetalert2';
import { InscriptionService } from '../../../../core/services/inscriptions.service';

@Injectable()
export class ClientEffects {
  loadClients$: Actions<Action<string>>;
  loadClientsAfterUpdate$: Actions<Action<string>>;
  createClients$: Actions<Action<string>>;
  updateClients$: Actions<Action<string>>;
  deleteClients$: Actions<Action<string>>;
  searchClients$: Actions<Action<string>>;

  constructor(
    private actions$: Actions,
    private clientsService: ClientsService,
    private inscriptionsService: InscriptionService
  ) {
    this.loadClients$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ClientActions.loadClients),
        concatMap((action) =>
          this.clientsService.getClients().pipe(
            map((res) => ClientActions.loadClientsSuccess({ data: res })),
            catchError((error) =>
              of(ClientActions.loadClientsFailure({ error }))
            )
          )
        )
      );
    });
    this.loadClientsAfterUpdate$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ClientActions.updateClientSuccess),
        map(() => ClientActions.loadClients())
      );
    });

    this.createClients$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ClientActions.createClient),
        mergeMap(({ client }) =>
          this.clientsService.createClient(client).pipe(
            map((newCourse) => {
              Swal.fire('¡Creado!', 'El cliente ha sido creado.', 'success');
              return ClientActions.createClientSuccess({
                client: newCourse,
              });
            }),
            catchError((error) => {
              Swal.fire('Error', 'No se pudo crear el cliente.', 'error');
              return of(ClientActions.createClientFailure({ error }));
            })
          )
        )
      );
    });

    this.updateClients$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ClientActions.updateClient),
        distinctUntilChanged(),
        mergeMap(({ id, update }) =>
          this.clientsService.updateClientById(id, update).pipe(
            map((client) => {
              const updateClient = client[0];
              Swal.fire('¡Actualizado!', 'El cliente ha sido actualizado.', 'success');
              return ClientActions.updateClientSuccess({
                client: updateClient,
              });
            }),
            catchError((error) => {
              Swal.fire('Error', 'No se pudo actualizar el cliente.', 'error');
              return of(ClientActions.updateClientFailure({ error }));
            })
          )
        )
      );
    });

    this.deleteClients$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ClientActions.deleteClient),
        switchMap(({ id }) =>
          this.clientsService.removeClientById(id).pipe(
            map((res) => {
              Swal.fire(
                '¡Eliminado!',
                'El cliente ha sido eliminado.',
                'success'
              );
              return ClientActions.deleteClientSuccess({ data: res });
            }),
            catchError((error) => {
              Swal.fire(
                'Error',
                'Hubo un problema al eliminar el cliente.',
                'error'
              );
              return of(ClientActions.deleteClientFailure({ error }));
            })
          )
        )
      );
    });

    this.searchClients$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ClientActions.searchClients),
        mergeMap(({ term }) =>
          (term
            ? this.inscriptionsService.searchClients(term)
            : this.clientsService.getClients()
          ).pipe(
            map((clients) =>
              ClientActions.searchClientsSuccess({ clients })
            ),
            catchError((error) =>
              of(ClientActions.searchClientsFailure({ error }))
            )
          )
        )
      )
    );
  }
}
