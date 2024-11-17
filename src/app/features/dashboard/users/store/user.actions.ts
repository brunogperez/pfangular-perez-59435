import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../models';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    'Load Users': emptyProps(),
    'Load Users Success': props<{ data: User[] }>(),
    'Load Users Failure': props<{ error: Error }>(),

    'Load User By Id': props<{ id: string }>(),
    'Load User By Id Success': props<{ data: User }>(),
    'Load User By Id Failure': props<{ error: Error }>(),

    'Create User': props<{ user: User }>(),
    'Create User Success': props<{ user: User }>(),
    'Create User Failure': props<{ error: Error }>(),

    'Update User': props<{ id: string; update: Partial<User> }>(),
    'Update User Success': props<{ user: User }>(),
    'Update User Failure': props<{ error: Error }>(),

    'Delete User': props<{ id: string }>(),
    'Delete User Success': props<{ data: User[] }>(),
    'Delete User Failure': props<{ error: Error }>(),
  },
});
