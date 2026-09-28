import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { CreditTransactionsService } from '../../core/services/credit-transactions.service';
import { NotificationService } from '../../core/services/notification.service';
import { CreditsActions } from '../actions/credits.actions';
import { selectCreditsFilter } from '../selectors/credits.selectors';

const errMessage = (e: any): string =>
  e?.error?.message ?? e?.message ?? 'Error inesperado';

@Injectable()
export class CreditsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private service = inject(CreditTransactionsService);
  private notify = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CreditsActions.load),
      withLatestFrom(this.store.select(selectCreditsFilter)),
      switchMap(([, filter]) =>
        this.service
          .getAll({ reseller: filter.reseller, type: filter.type, limit: filter.limit ?? 200 })
          .pipe(
            map((transactions) => CreditsActions.loadSuccess({ transactions })),
            catchError((e) => of(CreditsActions.loadFailure({ error: errMessage(e) })))
          )
      )
    )
  );

  reloadOnServerFilterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CreditsActions.setFilter),
      // server-side filters: reseller/type/limit. Date filters are client-side via selector.
      map(() => CreditsActions.load())
    )
  );

  failureToasts$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CreditsActions.loadFailure),
        tap(({ error }) => this.notify.showError(error))
      ),
    { dispatch: false }
  );
}
