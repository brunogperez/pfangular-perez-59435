import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Inscription } from '../models';

export const InscriptionActions = createActionGroup({
  source: 'Inscription',
  events: {
    'Load Inscriptions': emptyProps(),
    'Load Inscriptions Success': props<{ data: Inscription[] }>(),
    'Load Inscriptions Failure': props<{ error: Error }>(),

    'Load Inscriptions By Course': props<{ courseId: string }>(),
    'Load Inscriptions By Course Success': props<{ data: Inscription[] }>(),
    'Load Inscriptions By Course Failure': props<{ error: Error }>(),

    'Create Inscription': props<{ courseId: string; studentId: string }>(),
    'Create Inscription Success': props<{ data: Inscription }>(),
    'Create Inscription Failure': props<{ error: Error }>(),

    'Delete Inscription': props<{ id: string }>(),
    'Delete Inscription Success': props<{ data: Inscription[] }>(),
    'Delete Inscription Failure': props<{ error: Error }>(),
  },
});
