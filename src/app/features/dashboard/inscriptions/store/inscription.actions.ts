import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const InscriptionActions = createActionGroup({
  source: 'Inscription',
  events: {
    'Load Inscriptions': emptyProps(),
    'Load Strudent Options': emptyProps(),
    'Load Course Options': emptyProps(),
    'Create Inscription': props<{ courseId: string; studentId: string }>(),
  },
});
