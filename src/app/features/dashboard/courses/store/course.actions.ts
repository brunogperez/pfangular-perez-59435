import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Course } from '../models';

export const CourseActions = createActionGroup({
  source: 'Course',
  events: {
    'Load Courses': emptyProps(),
    'Load Courses Success': props<{ data: Course[] }>(),
    'Load Courses Failure': props<{ error: Error }>(),

    'Load Course By Id': props<{ id: string }>(),
    'Load Course By Id Success': props<{ data: Course }>(),
    'Load Course By Id Failure': props<{ error: Error }>(),

    'Create Course': props<{ course: Course }>(),
    'Create Course Success': props<{ course: Course }>(),
    'Create Course Failure': props<{ error: Error }>(),

    'Update Course': props<{ id: string; update: Partial<Course> }>(),
    'Update Course Success': props<{ course: Course }>(),
    'Update Course Failure': props<{ error: Error }>(),

    'Delete Course': props<{ id: string }>(),
    'Delete Course Success': props<{ data: Course[] }>(),
    'Delete Course Failure': props<{ error: Error }>(),
  },
});
