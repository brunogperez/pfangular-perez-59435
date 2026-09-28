import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { PlansService } from '../../core/services/plans.service';
import { NotificationService } from '../../core/services/notification.service';
import { PlansActions } from '../actions/plans.actions';
import { selectPlansFilter } from '../selectors/plans.selectors';

const errMessage = (e: any): string =>
  e?.error?.message ?? e?.message ?? 'Error inesperado';

@Injectable()
export class PlansEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private service = inject(PlansService);
  private notify = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.load),
      withLatestFrom(this.store.select(selectPlansFilter)),
      switchMap(([, filter]) =>
        this.service.getAll(filter).pipe(
          map((plans) => PlansActions.loadSuccess({ plans })),
          catchError((e) => of(PlansActions.loadFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  reloadOnFilterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.setFilter),
      map(() => PlansActions.load())
    )
  );

  loadServiceTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.loadServiceTypes),
      switchMap(() =>
        this.service.getServiceTypes().pipe(
          map((serviceTypes) => PlansActions.loadServiceTypesSuccess({ serviceTypes })),
          catchError((e) =>
            of(PlansActions.loadServiceTypesFailure({ error: errMessage(e) }))
          )
        )
      )
    )
  );

  refreshServiceTypesAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.createSuccess, PlansActions.updateSuccess, PlansActions.deleteSuccess),
      map(() => PlansActions.loadServiceTypes())
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.create),
      mergeMap(({ payload }) =>
        this.service.create(payload).pipe(
          map((plan) => PlansActions.createSuccess({ plan })),
          catchError((e) => of(PlansActions.createFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.update),
      mergeMap(({ id, payload }) =>
        this.service.update(id, payload).pipe(
          map((plan) => PlansActions.updateSuccess({ plan })),
          catchError((e) => of(PlansActions.updateFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.delete),
      mergeMap(({ id }) =>
        this.service.delete(id).pipe(
          map(() => PlansActions.deleteSuccess({ id })),
          catchError((e) => of(PlansActions.deleteFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  successToasts$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PlansActions.createSuccess,
          PlansActions.updateSuccess,
          PlansActions.deleteSuccess
        ),
        tap((action) => {
          const map: Record<string, string> = {
            [PlansActions.createSuccess.type]: 'Plan creado.',
            [PlansActions.updateSuccess.type]: 'Plan actualizado.',
            [PlansActions.deleteSuccess.type]: 'Plan eliminado.',
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
          PlansActions.loadFailure,
          PlansActions.createFailure,
          PlansActions.updateFailure,
          PlansActions.deleteFailure
        ),
        tap(({ error }) => this.notify.showError(error))
      ),
    { dispatch: false }
  );
}
