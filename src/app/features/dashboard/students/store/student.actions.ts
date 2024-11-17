import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Student } from '../models';

export const StudentActions = createActionGroup({
  source: 'Student',
  events: {
    'Load Students': emptyProps(),
    'Load Students Success': props<{ data: Student[] }>(),
    'Load Students Failure': props<{ error: Error }>(),

    'Create Student': props<{ student: Student }>(),
    'Create Student Success': props<{ student: Student }>(),
    'Create Student Failure': props<{ error: Error }>(),

    'Update Student': props<{ id: string; update: Partial<Student> }>(),
    'Update Student Success': props<{ student: Student }>(),
    'Update Student Failure': props<{ error: Error }>(),

    'Delete Student': props<{ id: string }>(),
    'Delete Student Success': props<{ data: Student[] }>(),
    'Delete Student Failure': props<{ error: Error }>(),

    'Search Students': props<{ term: string }>(),
    'Search Students Success': props<{ students: Student[] }>(),
    'Search Students Failure': props<{ error: Error }>(),
  },
});
