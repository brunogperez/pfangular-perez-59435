import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  concatMap,
  map,
  mergeMap,
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { InscriptionActions } from './inscription.actions';
import { InscriptionService } from '../../../../core/services/inscriptions.service';
import { Action } from '@ngrx/store';
import { NotificationService } from '../../../../core/services/notification.service';

@Injectable()
export class InscriptionEffects {
  loadInscriptions$: Actions<Action<string>>;
  createInscription$: Actions<Action<string>>;
  createInscriptionSuccess$: Actions<Action<string>>;
  loadInscriptionsByProduct$: Actions<Action<string>>;
  deleteInscription$: Actions<Action<string>>;
  loadInscriptionsAfterDelete$: Actions<Action<string>>;

  constructor(
    private actions$: Actions,
    private inscriptionService: InscriptionService,
    private notificationService: NotificationService,
  ) {
    this.loadInscriptions$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(InscriptionActions.loadInscriptions),
        concatMap(() =>
          this.inscriptionService.getInscriptions().pipe(
            map((res) => {
              return InscriptionActions.loadInscriptionsSuccess({ data: res });
            }),
            catchError((error) =>
              of(InscriptionActions.loadInscriptionsFailure({ error }))
            )
          )
        )
      );
    });

    this.loadInscriptionsByProduct$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(InscriptionActions.loadInscriptionsByProduct),
        mergeMap((action) =>
          this.inscriptionService.getInscriptionsByProduct(action.productId).pipe(
            map((data) => {
              return InscriptionActions.loadInscriptionsByProductSuccess({ data });
            }),
            catchError((error) =>
              of(InscriptionActions.loadInscriptionsByProductFailure({ error }))
            )
          )
        )
      );
    });

    this.createInscription$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(InscriptionActions.createInscription),
        concatMap((action) =>
          this.inscriptionService
            .createInscription({
              clientId: action.clientId,
              productId: action.productId,
            })
            .pipe(
              map((data) => {
                this.notificationService.showSuccess('Inscripción creada exitosamente.');
                return InscriptionActions.createInscriptionSuccess({ data });
              }),
              catchError((error) =>
                of(InscriptionActions.createInscriptionFailure({ error }))
              )
            )
        )
      );
    });

    this.createInscriptionSuccess$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(InscriptionActions.createInscriptionSuccess),
        map(() => InscriptionActions.loadInscriptions())
      );
    });

    this.deleteInscription$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(InscriptionActions.deleteInscription),
        switchMap(({ id }) =>
          this.inscriptionService.deleteInscription(id).pipe(
            map((res) => {
              this.notificationService.showSuccess('La inscripción ha sido eliminada.', '¡Eliminado!');
              return InscriptionActions.deleteInscriptionSuccess({ data: res });
            }),
            catchError((error) => {
              this.notificationService.showError('Hubo un problema al eliminar la inscripción.');
              return of(InscriptionActions.deleteInscriptionFailure({ error }));
            })
          )
        )
      );
    });

    this.loadInscriptionsAfterDelete$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(InscriptionActions.deleteInscriptionSuccess),
        map(() => InscriptionActions.loadInscriptions())
      );
    });
  }
}
