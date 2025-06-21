import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  map,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { ClientActions } from './client.actions';
import { ClientsService } from '../../../../core/services/clients.service';
import { Action } from '@ngrx/store';
import Swal from 'sweetalert2';
import { InscriptionService } from '../../../../core/services/inscriptions.service';

@Injectable()
export class ClientEffects {
  loadClients$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientActions.loadClients),
      mergeMap(({ page, limit, search }) =>
        this.clientsService.getClients(page, limit, search).pipe(
          map((response) => 
            ClientActions.loadClientsSuccess({ 
              data: response.data,
              total: response.total,
              page: response.page,
              totalPages: response.totalPages
            })
          ),
          catchError((error) =>
            of(ClientActions.loadClientsFailure({ error: error.message }))
          )
        )
      )
    );
  });

  loadClientsAfterUpdate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        ClientActions.updateClientSuccess,
        ClientActions.deleteClientSuccess,
        ClientActions.createClientSuccess
      ),
      map((action) => {
        // Get the current page from the state or default to 1
        const page = 'page' in action ? action.page : 1;
        return ClientActions.loadClients({ page });
      })
    );
  });

  createClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientActions.createClient),
      mergeMap(({ client }) =>
        this.clientsService.createClient(client).pipe(
          map((newClient) => {
            Swal.fire('¡Creado!', 'El cliente ha sido creado.', 'success');
            return ClientActions.createClientSuccess({
              client: newClient,
            });
          }),
          catchError((error) => {
            Swal.fire('Error', 'No se pudo crear el cliente.', 'error');
            return of(ClientActions.createClientFailure({ error: error.message }));
          })
        )
      )
    );
  });

  updateClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientActions.updateClient),
      distinctUntilChanged(),
      mergeMap(({ id, update }) =>
        this.clientsService.updateClient(id, update).pipe(
          map((updatedClient) => {
            Swal.fire('¡Actualizado!', 'El cliente ha sido actualizado.', 'success');
            return ClientActions.updateClientSuccess({
              client: updatedClient,
            });
          }),
          catchError((error) => {
            Swal.fire('Error', 'No se pudo actualizar el cliente.', 'error');
            return of(ClientActions.updateClientFailure({ error: error.message }));
          })
        )
      )
    );
  });

  deleteClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientActions.deleteClient),
      mergeMap(({ id, page }) =>
        this.clientsService.deleteClient(id).pipe(
          map(() => {
            Swal.fire('¡Eliminado!', 'El cliente ha sido eliminado.', 'success');
            return ClientActions.deleteClientSuccess({ id, page });
          }),
          catchError((error) => {
            Swal.fire('Error', 'Hubo un problema al eliminar el cliente.', 'error');
            return of(ClientActions.deleteClientFailure({ error: error.message }));
          })
        )
      )
    );
  });

  searchClients$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClientActions.searchClients),
      mergeMap(({ term }) =>
        this.clientsService.searchClients(term).pipe(
          map((clients) =>
            ClientActions.searchClientsSuccess({ clients })
          ),
          catchError((error) =>
            of(ClientActions.searchClientsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private clientsService: ClientsService,
    private inscriptionsService: InscriptionService
  ) {}
}
