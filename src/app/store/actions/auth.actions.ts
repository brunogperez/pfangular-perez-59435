import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthData, User } from '../../core/models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ authData: AuthData }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: string }>(),

    'Logout': emptyProps(),

    'Verify Token': emptyProps(),
    'Verify Token Success': props<{ user: User }>(),
    'Verify Token Failure': emptyProps(),

    'Set Authenticated User': props<{ user: User }>(),
    'Unset Authenticated User': emptyProps(),
  },
});
