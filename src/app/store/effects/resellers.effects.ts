import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { ResellersService } from '../../core/services/resellers.service';
import { NotificationService } from '../../core/services/notification.service';
import { ResellersActions } from '../actions/resellers.actions';

const errMessage = (e: any): string =>
  e?.error?.message ?? e?.message ?? 'Error inesperado';

@Injectable()
export class ResellersEffects {
  private actions$ = inject(Actions);
  private service = inject(ResellersService);
  private notify = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResellersActions.load),
      mergeMap(() =>
        this.service.getAll({ includeOwner: true }).pipe(
          map((resellers) => ResellersActions.loadSuccess({ resellers })),
          catchError((e) => of(ResellersActions.loadFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResellersActions.create),
      mergeMap(({ payload }) =>
        this.service.create(payload).pipe(
          map((reseller) => ResellersActions.createSuccess({ reseller })),
          catchError((e) => of(ResellersActions.createFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResellersActions.update),
      mergeMap(({ id, payload }) =>
        this.service.update(id, payload).pipe(
          map((reseller) => ResellersActions.updateSuccess({ reseller })),
          catchError((e) => of(ResellersActions.updateFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResellersActions.delete),
      mergeMap(({ id }) =>
        this.service.delete(id).pipe(
          map(() => ResellersActions.deleteSuccess({ id })),
          catchError((e) => of(ResellersActions.deleteFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  topup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResellersActions.topup),
      mergeMap(({ id, payload }) =>
        this.service.topup(id, payload).pipe(
          map(({ reseller, transaction }) =>
            ResellersActions.topupSuccess({ reseller, transaction })
          ),
          catchError((e) => of(ResellersActions.topupFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  adjust$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResellersActions.adjust),
      mergeMap(({ id, payload }) =>
        this.service.adjust(id, payload).pipe(
          map(({ reseller, transaction }) =>
            ResellersActions.adjustSuccess({ reseller, transaction })
          ),
          catchError((e) => of(ResellersActions.adjustFailure({ error: errMessage(e) })))
        )
      )
    )
  );

  successToasts$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          ResellersActions.createSuccess,
          ResellersActions.updateSuccess,
          ResellersActions.deleteSuccess,
          ResellersActions.topupSuccess,
          ResellersActions.adjustSuccess
        ),
        tap((action) => {
          const map: Record<string, string> = {
            [ResellersActions.createSuccess.type]: 'Reseller creado.',
            [ResellersActions.updateSuccess.type]: 'Reseller actualizado.',
            [ResellersActions.deleteSuccess.type]: 'Reseller eliminado.',
            [ResellersActions.topupSuccess.type]: 'Créditos cargados.',
            [ResellersActions.adjustSuccess.type]: 'Saldo ajustado.',
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
          ResellersActions.loadFailure,
          ResellersActions.createFailure,
          ResellersActions.updateFailure,
          ResellersActions.deleteFailure,
          ResellersActions.topupFailure,
          ResellersActions.adjustFailure
        ),
        tap(({ error }) => this.notify.showError(error))
      ),
    { dispatch: false }
  );
}
