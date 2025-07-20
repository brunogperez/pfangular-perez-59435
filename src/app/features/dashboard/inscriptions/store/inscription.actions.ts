import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Inscription } from '../models';

export const InscriptionActions = createActionGroup({
  source: 'Inscription',
  events: {
    'Load Inscriptions': emptyProps(),
    'Load Inscriptions Success': props<{ data: Inscription[] }>(),
    'Load Inscriptions Failure': props<{ error: Error }>(),

    'Load Inscriptions By Product': props<{ productId: string }>(),
    'Load Inscriptions By Product Success': props<{ data: Inscription[] }>(),
    'Load Inscriptions By Product Failure': props<{ error: Error }>(),

    'Create Inscription': props<{ productId: string; clientId: string }>(),
    'Create Inscription Success': props<{ data: Inscription }>(),
    'Create Inscription Failure': props<{ error: Error }>(),

    'Delete Inscription': props<{ id: string }>(),
    'Delete Inscription Success': props<{ data: Inscription[] }>(),
    'Delete Inscription Failure': props<{ error: Error }>(),
  },
});
