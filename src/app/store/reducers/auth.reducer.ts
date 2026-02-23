import { createReducer, on } from '@ngrx/store';
import { User } from '../../features/dashboard/users/models';
import { AuthActions } from '../actions/auth.actions';

export const authFeatureName = 'auth';

export interface AuthState {
  authenticatedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  authenticatedUser: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    authenticatedUser: user,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    authenticatedUser: null,
  })),
  on(AuthActions.verifyTokenSuccess, (state, { user }) => ({
    ...state,
    authenticatedUser: user,
  })),
  on(AuthActions.verifyTokenFailure, (state) => ({
    ...state,
    authenticatedUser: null,
  })),
  on(AuthActions.setAuthenticatedUser, (state, { user }) => ({
    ...state,
    authenticatedUser: user,
  })),
  on(AuthActions.unsetAuthenticatedUser, (state) => ({
    ...state,
    authenticatedUser: null,
  }))
);
