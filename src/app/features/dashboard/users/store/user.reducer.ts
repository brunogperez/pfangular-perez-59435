import { createFeature, createReducer, on } from '@ngrx/store';
import { UserActions } from './user.actions';
import { User } from '../models';

export const userFeatureKey = 'user';

export interface State {
  users: User[];
  user: User;
}

export const initialState: State = {
  users: [],
  user: {} as User,
};

export const reducer = createReducer(
  initialState,
  ////////// SECCION LOAD
  on(UserActions.loadUsers, (state) => {
    return {
      ...state,
    };
  }),
  on(UserActions.loadUsersSuccess, (state, action) => {
    return {
      ...state,
      users: action.data,
    };
  }),
  on(UserActions.loadUsersFailure, (state, error) => {
    return {
      ...state,
      error,
    };
  }),
  on(UserActions.loadUserById, (state) => {
    return {
      ...state,
    };
  }),
  on(UserActions.loadUserByIdSuccess, (state, { data: user }) => {
    return {
      ...state,
      user,
    };
  }),
  on(UserActions.loadUserByIdFailure, (state, error) => {
    return {
      ...state,
      error,
    };
  }),

  ////////// SECCION CREATE
  on(UserActions.createUserSuccess, (state, { user }) => ({
    ...state,
    users: [...state.users, user],
  })),
  on(UserActions.createUserFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  ////////// SECCION UPDATE
  on(UserActions.updateUser, (state) => {
    return {
      ...state,
    };
  }),
  on(UserActions.updateUserSuccess, (state, { user }) => {
    return {
      ...state,
      users: state.users.map((c) => (c.id === user.id ? user : c)),
    };
  }),
  on(UserActions.updateUserFailure, (state, { error }) => {
    return {
      ...state,
      error,
    };
  }),

  ////////// SECCION DELETE
  on(UserActions.deleteUser, (state, { id }) => ({
    ...state,
    users: state.users.filter((user) => user.id !== id),
  }))
);

export const userFeature = createFeature({
  name: userFeatureKey,
  reducer,
});
