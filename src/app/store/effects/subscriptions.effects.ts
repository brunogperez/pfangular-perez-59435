import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { SubscriptionsService } from '../../core/services/subscriptions.service';
import { NotificationService } from '../../core/services/notification.service';
import { SubscriptionsActions } from '../actions/subscriptions.actions';
import { selectSubscriptionsFilter } from '../selectors/subscriptions.selectors';

const errMessage = (e: any): string =>
  e?.error?.message ?? e?.message ?? 'Error inesperado';

@Injectable()
export class SubscriptionsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private service = inject(SubscriptionsService);
  private notify = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.load),
      withLatestFrom(this.store.select(selectSubscriptionsFilter)),
      switchMap(([, filter]) =>
        this.service.getAll(filter).pipe(
          map((subscriptions) => SubscriptionsActions.loadSuccess({ subscriptions })),
          catchError((e) => of(SubscriptionsActions.loadFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  reloadOnFilterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.setFilter),
      map(() => SubscriptionsActions.load())
    )
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.loadStats),
      switchMap(() =>
        this.service.getStats().pipe(
          map((stats) => SubscriptionsActions.loadStatsSuccess({ stats })),
          catchError((e) =>
            of(SubscriptionsActions.loadStatsFailure({ error: errMessage(e) }))
          )
        )
      )
    )
  );

  refreshStatsAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        SubscriptionsActions.createSuccess,
        SubscriptionsActions.renewSuccess,
        SubscriptionsActions.cancelSuccess,
        SubscriptionsActions.deleteSuccess
      ),
      map(() => SubscriptionsActions.loadStats())
    )
  );

  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        SubscriptionsActions.createSuccess,
        SubscriptionsActions.renewSuccess,
        SubscriptionsActions.cancelSuccess
      ),
      map(() => SubscriptionsActions.load())
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.create),
      mergeMap(({ payload }) =>
        this.service.create(payload).pipe(
          map((subscription) => SubscriptionsActions.createSuccess({ subscription })),
          catchError((e) => of(SubscriptionsActions.createFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.update),
      mergeMap(({ id, payload }) =>
        this.service.update(id, payload).pipe(
          map((subscription) => SubscriptionsActions.updateSuccess({ subscription })),
          catchError((e) => of(SubscriptionsActions.updateFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  renew$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.renew),
      mergeMap(({ id, payload }) =>
        this.service.renew(id, payload).pipe(
          map((subscription) => SubscriptionsActions.renewSuccess({ subscription })),
          catchError((e) => of(SubscriptionsActions.renewFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  cancel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.cancel),
      mergeMap(({ id }) =>
        this.service.cancel(id).pipe(
          map((subscription) => SubscriptionsActions.cancelSuccess({ subscription })),
          catchError((e) => of(SubscriptionsActions.cancelFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.delete),
      mergeMap(({ id }) =>
        this.service.delete(id).pipe(
          map(() => SubscriptionsActions.deleteSuccess({ id })),
          catchError((e) => of(SubscriptionsActions.deleteFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  successToasts$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          SubscriptionsActions.createSuccess,
          SubscriptionsActions.updateSuccess,
          SubscriptionsActions.renewSuccess,
          SubscriptionsActions.cancelSuccess,
          SubscriptionsActions.deleteSuccess
        ),
        tap((action) => {
          const map: Record<string, string> = {
            [SubscriptionsActions.createSuccess.type]: 'Suscripción creada.',
            [SubscriptionsActions.updateSuccess.type]: 'Suscripción actualizada.',
            [SubscriptionsActions.renewSuccess.type]: 'Suscripción renovada.',
            [SubscriptionsActions.cancelSuccess.type]: 'Suscripción cancelada.',
            [SubscriptionsActions.deleteSuccess.type]: 'Suscripción eliminada.',
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
          SubscriptionsActions.loadFailure,
          SubscriptionsActions.createFailure,
          SubscriptionsActions.updateFailure,
          SubscriptionsActions.renewFailure,
          SubscriptionsActions.cancelFailure,
          SubscriptionsActions.deleteFailure
        ),
        tap(({ error }) => this.notify.showError(error))
      ),
    { dispatch: false }
  );
}
