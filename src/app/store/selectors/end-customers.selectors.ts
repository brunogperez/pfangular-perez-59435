import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  endCustomersFeatureName,
  EndCustomersState,
} from '../reducers/end-customers.reducer';

const selectState = createFeatureSelector<EndCustomersState>(endCustomersFeatureName);

export const selectEndCustomers = createSelector(selectState, (s) => s.items);
export const selectEndCustomersFilter = createSelector(selectState, (s) => s.filter);
export const selectEndCustomersLoading = createSelector(selectState, (s) => s.loading);
export const selectEndCustomersSaving = createSelector(selectState, (s) => s.saving);
export const selectEndCustomersError = createSelector(selectState, (s) => s.error);
