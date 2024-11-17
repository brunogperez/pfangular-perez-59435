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
  loadInscriptionsByCourse$: Actions<Action<string>>;
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
            map((res) =>
              InscriptionActions.loadInscriptionsSuccess({ data: res })
            ),
            catchError((error) =>
              of(InscriptionActions.loadInscriptionsFailure({ error }))
            )
          )
        )
      );
    });

    this.loadInscriptionsByCourse$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(InscriptionActions.loadInscriptionsByCourse),
        mergeMap((action) =>
          this.inscriptionService.getInscriptionsByCourse(action.courseId).pipe(
            map((data) =>
              InscriptionActions.loadInscriptionsByCourseSuccess({ data })
            ),
            catchError((error) =>
              of(InscriptionActions.loadInscriptionsByCourseFailure({ error }))
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
              studentId: action.studentId,
              courseId: action.courseId,
            })
            .pipe(
              map((data) =>
                InscriptionActions.createInscriptionSuccess({ data })
              ),
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
