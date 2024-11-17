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
import { CourseActions } from './course.actions';
import { Action } from '@ngrx/store';
import { CoursesService } from '../../../../core/services/courses.service';
import Swal from 'sweetalert2';

@Injectable()
export class CourseEffects {
  loadCourses$: Actions<Action<string>>;
  loadCourseById$: Actions<Action<string>>;
  loadCoursesAfterUpdate$: Actions<Action<string>>;
  deleteCourses$: Actions<Action<string>>;
  updateCourses$: Actions<Action<string>>;
  createCourses$: Actions<Action<string>>;

  constructor(
    private actions$: Actions,
    private coursesService: CoursesService
  ) {
    this.loadCourses$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(CourseActions.loadCourses),
        concatMap((action) =>
          this.coursesService.getCourses().pipe(
            map((res) => CourseActions.loadCoursesSuccess({ data: res })),
            catchError((error) =>
              of(CourseActions.loadCoursesFailure({ error }))
            )
          )
        )
      );
    });

    this.loadCourseById$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CourseActions.loadCourseById),
        mergeMap(({ id }) =>
          this.coursesService.getCourseById(id).pipe(
            map((course) =>
              CourseActions.loadCourseByIdSuccess({ data: course })
            ),
            catchError((error) =>
              of(CourseActions.loadCourseByIdFailure({ error }))
            )
          )
        )
      )
    );

    this.loadCoursesAfterUpdate$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(CourseActions.updateCourseSuccess),
        map(() => CourseActions.loadCourses())
      );
    });

    this.createCourses$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(CourseActions.createCourse),
        mergeMap(({ course }) =>
          this.coursesService.createCourse(course).pipe(
            map((newCourse) => {
              return CourseActions.createCourseSuccess({ course: newCourse });
            }),
            catchError((error) => {
              Swal.fire('Error', 'No se pudo crear el curso.', 'error');
              return of(CourseActions.createCourseFailure({ error }));
            })
          )
        )
      );
    });

    this.updateCourses$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(CourseActions.updateCourse),
        distinctUntilChanged(),
        mergeMap(({ id, update }) =>
          this.coursesService.updateCourseById(id, update).pipe(
            map((course) => {
              const updatedCourse = course[0];
              return CourseActions.updateCourseSuccess({
                course: updatedCourse,
              });
            }),
            catchError((error) => {
              Swal.fire('Error', 'No se pudo actualizar el curso.', 'error');
              return of(CourseActions.updateCourseFailure({ error }));
            })
          )
        )
      );
    });

    this.deleteCourses$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(CourseActions.deleteCourse),
        switchMap(({ id }) =>
          this.coursesService.removeCourseById(id).pipe(
            map((res) => {
              Swal.fire(
                '¡Eliminado!',
                'El curso ha sido eliminado.',
                'success'
              );
              return CourseActions.deleteCourseSuccess({ data: res });
            }),
            catchError((error) => {
              Swal.fire(
                'Error',
                'Hubo un problema al eliminar el curso.',
                'error'
              );
              return of(CourseActions.deleteCourseFailure({ error }));
            })
          )
        )
      );
    });
  }
}
