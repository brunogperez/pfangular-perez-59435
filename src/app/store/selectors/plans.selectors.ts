import { createFeatureSelector, createSelector } from '@ngrx/store';
import { plansFeatureName, PlansState } from '../reducers/plans.reducer';

const selectState = createFeatureSelector<PlansState>(plansFeatureName);

export const selectPlans = createSelector(selectState, (s) => s.items);
export const selectPlansServiceTypes = createSelector(selectState, (s) => s.serviceTypes);
export const selectPlansFilter = createSelector(selectState, (s) => s.filter);
export const selectPlansLoading = createSelector(selectState, (s) => s.loading);
export const selectPlansSaving = createSelector(selectState, (s) => s.saving);
export const selectPlansError = createSelector(selectState, (s) => s.error);
