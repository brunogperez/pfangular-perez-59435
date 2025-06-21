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
import Swal from 'sweetalert2';

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
              Swal.fire('Error', 'No se pudo cargar la lista de clientes.', 'error');
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
              Swal.fire('Error', 'No se pudo cargar el cliente.', 'error');
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
              Swal.fire('Éxito', 'Cliente creado exitosamente.', 'success');
              return ClientActions.createClientSuccess({ client: createdClient });
            }),
            catchError((error) => {
              Swal.fire('Error', 'No se pudo crear el cliente.', 'error');
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
              Swal.fire('Éxito', 'Cliente actualizado exitosamente.', 'success');
              return ClientActions.updateClientSuccess({ client: updatedClient });
            }),
            catchError((error) => {
              Swal.fire('Error', 'No se pudo actualizar el cliente.', 'error');
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
              Swal.fire('Éxito', 'Cliente eliminado exitosamente.', 'success');
              return ClientActions.deleteClientSuccess({ id });
            }),
            map(() => {
              Swal.fire({
                title: ' Eliminado!',
                text: 'El cliente ha sido eliminado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok',
              });
              return ClientActions.deleteClientSuccess({ id });
            }),

            catchError((error) =>
              of(ClientActions.deleteClientFailure({ error: error.message }))
            )
          )
        )
      )
    );
  }
}
