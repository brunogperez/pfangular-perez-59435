import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { EndCustomersService } from '../../core/services/end-customers.service';
import { NotificationService } from '../../core/services/notification.service';
import { EndCustomersActions } from '../actions/end-customers.actions';
import { selectEndCustomersFilter } from '../selectors/end-customers.selectors';

const errMessage = (e: any): string =>
  e?.error?.message ?? e?.message ?? 'Error inesperado';

@Injectable()
export class EndCustomersEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private service = inject(EndCustomersService);
  private notify = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndCustomersActions.load),
      withLatestFrom(this.store.select(selectEndCustomersFilter)),
      switchMap(([, filter]) =>
        this.service.getAll(filter).pipe(
          map((customers) => EndCustomersActions.loadSuccess({ customers })),
          catchError((e) => of(EndCustomersActions.loadFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  reloadOnFilterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndCustomersActions.setFilter),
      map(() => EndCustomersActions.load())
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndCustomersActions.create),
      mergeMap(({ payload }) =>
        this.service.create(payload).pipe(
          map((customer) => EndCustomersActions.createSuccess({ customer })),
          catchError((e) => of(EndCustomersActions.createFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  reloadAfterCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndCustomersActions.createSuccess),
      map(() => EndCustomersActions.load())
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndCustomersActions.update),
      mergeMap(({ id, payload }) =>
        this.service.update(id, payload).pipe(
          map((customer) => EndCustomersActions.updateSuccess({ customer })),
          catchError((e) => of(EndCustomersActions.updateFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  reloadAfterUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndCustomersActions.updateSuccess),
      map(() => EndCustomersActions.load())
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndCustomersActions.delete),
      mergeMap(({ id }) =>
        this.service.delete(id).pipe(
          map(() => EndCustomersActions.deleteSuccess({ id })),
          catchError((e) => of(EndCustomersActions.deleteFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  successToasts$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          EndCustomersActions.createSuccess,
          EndCustomersActions.updateSuccess,
          EndCustomersActions.deleteSuccess
        ),
        tap((action) => {
          const map: Record<string, string> = {
            [EndCustomersActions.createSuccess.type]: 'Cliente creado.',
            [EndCustomersActions.updateSuccess.type]: 'Cliente actualizado.',
            [EndCustomersActions.deleteSuccess.type]: 'Cliente eliminado.',
          };
          this.notify.showSuccess(map[action.type] ?? 'Operación exitosa.');
        })
      ),
    { dispatch: false }
  );

  failureToasts$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          EndCustomersActions.loadFailure,
          EndCustomersActions.createFailure,
          EndCustomersActions.updateFailure,
          EndCustomersActions.deleteFailure
        ),
        tap(({ error }) => this.notify.showError(error))
      ),
    { dispatch: false }
  );
}
