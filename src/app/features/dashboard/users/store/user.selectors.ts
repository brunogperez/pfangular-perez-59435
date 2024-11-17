import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromUser from './user.reducer';

export const selectUserState = createFeatureSelector<fromUser.State>(
  fromUser.userFeatureKey
);

export const selectorUsers = createSelector(
  selectUserState,
  (state) => state.users
);
export const selectorUserById = createSelector(
  selectUserState,
  (state) => state.user
);
