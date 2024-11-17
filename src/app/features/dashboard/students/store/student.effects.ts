import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  catchError,
  concatMap,
  distinctUntilChanged,
  map,
  mergeMap,
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { StudentActions } from './student.actions';
import { StudentsService } from '../../../../core/services/students.service';
import { Action } from '@ngrx/store';
import Swal from 'sweetalert2';
import { InscriptionService } from '../../../../core/services/inscriptions.service';

@Injectable()
export class StudentEffects {
  loadStudents$: Actions<Action<string>>;
  loadStudentsAfterUpdate$: Actions<Action<string>>;
  createStudents$: Actions<Action<string>>;
  updateStudents$: Actions<Action<string>>;
  deleteStudents$: Actions<Action<string>>;
  searchStudents$: Actions<Action<string>>;

  constructor(
    private actions$: Actions,
    private studentsService: StudentsService,
    private inscriptionsService: InscriptionService
  ) {
    this.loadStudents$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(StudentActions.loadStudents),
        concatMap((action) =>
          this.studentsService.getStudents().pipe(
            map((res) => StudentActions.loadStudentsSuccess({ data: res })),
            catchError((error) =>
              of(StudentActions.loadStudentsFailure({ error }))
            )
          )
        )
      );
    });
    this.loadStudentsAfterUpdate$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(StudentActions.updateStudentSuccess),
        map(() => StudentActions.loadStudents())
      );
    });

    this.createStudents$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(StudentActions.createStudent),
        mergeMap(({ student }) =>
          this.studentsService.createStudent(student).pipe(
            map((newCourse) => {
              return StudentActions.createStudentSuccess({
                student: newCourse,
              });
            }),
            catchError((error) => {
              Swal.fire('Error', 'No se pudo crear el curso.', 'error');
              return of(StudentActions.createStudentFailure({ error }));
            })
          )
        )
      );
    });

    this.updateStudents$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(StudentActions.updateStudent),
        distinctUntilChanged(),
        mergeMap(({ id, update }) =>
          this.studentsService.updateStudentById(id, update).pipe(
            map((student) => {
              const updateStudent = student[0];
              return StudentActions.updateStudentSuccess({
                student: updateStudent,
              });
            }),
            catchError((error) => {
              Swal.fire('Error', 'No se pudo actualizar el alumno.', 'error');
              return of(StudentActions.updateStudentFailure({ error }));
            })
          )
        )
      );
    });

    this.deleteStudents$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(StudentActions.deleteStudent),
        switchMap(({ id }) =>
          this.studentsService.removeStudentById(id).pipe(
            map((res) => {
              Swal.fire(
                '¡Eliminado!',
                'El alumno ha sido eliminado.',
                'success'
              );
              return StudentActions.deleteStudentSuccess({ data: res });
            }),
            catchError((error) => {
              Swal.fire(
                'Error',
                'Hubo un problema al eliminar el alumno.',
                'error'
              );
              return of(StudentActions.deleteStudentFailure({ error }));
            })
          )
        )
      );
    });

    this.searchStudents$ = createEffect(() =>
      this.actions$.pipe(
        ofType(StudentActions.searchStudents),
        mergeMap(({ term }) =>
          (term
            ? this.inscriptionsService.searchStudents(term)
            : this.studentsService.getStudents()
          ).pipe(
            map((students) =>
              StudentActions.searchStudentsSuccess({ students })
            ),
            catchError((error) =>
              of(StudentActions.searchStudentsFailure({ error }))
            )
          )
        )
      )
    );
  }
}
