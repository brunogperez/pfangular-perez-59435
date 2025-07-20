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
import Swal from 'sweetalert2';

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
    private inscriptionService: InscriptionService
  ) {
    this.loadInscriptions$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(InscriptionActions.loadInscriptions),
        concatMap((action) =>
          this.inscriptionService.getInscriptions().pipe(
            map((res) => {
              Swal.fire('Éxito', 'Inscripciones cargadas exitosamente.', 'success');
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
              Swal.fire('Éxito', 'Inscripciones del curso cargadas exitosamente.', 'success');
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
                Swal.fire('Éxito', 'Inscripción creada exitosamente.', 'success');
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
              Swal.fire(
                '¡Eliminado!',
                'La inscripción ha sido eliminada.',
                'success'
              );
              return InscriptionActions.deleteInscriptionSuccess({ data: res });
            }),
            catchError((error) => {
              Swal.fire(
                'Error',
                'Hubo un problema al eliminar la inscripción.',
                'error'
              );
              return of(InscriptionActions.deleteInscriptionFailure({ error }));
            })
          )
        ),
        switchMap(() => {
          return of(InscriptionActions.loadInscriptions());
        })
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
