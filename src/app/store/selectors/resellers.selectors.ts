import { createFeatureSelector, createSelector } from '@ngrx/store';
import { resellersFeatureName, ResellersState } from '../reducers/resellers.reducer';

const selectResellersState = createFeatureSelector<ResellersState>(resellersFeatureName);

export const selectResellers = createSelector(
  selectResellersState,
  (s) => s.items
);

export const selectResellersLoading = createSelector(
  selectResellersState,
  (s) => s.loading
);

export const selectResellersSaving = createSelector(
  selectResellersState,
  (s) => s.saving
);

export const selectResellersError = createSelector(
  selectResellersState,
  (s) => s.error
);
