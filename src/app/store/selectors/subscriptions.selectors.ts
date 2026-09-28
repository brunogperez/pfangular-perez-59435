import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  subscriptionsFeatureName,
  SubscriptionsState,
} from '../reducers/subscriptions.reducer';

const selectState = createFeatureSelector<SubscriptionsState>(subscriptionsFeatureName);

export const selectSubscriptions = createSelector(selectState, (s) => s.items);
export const selectSubscriptionsStats = createSelector(selectState, (s) => s.stats);
export const selectSubscriptionsFilter = createSelector(selectState, (s) => s.filter);
export const selectSubscriptionsLoading = createSelector(selectState, (s) => s.loading);
export const selectSubscriptionsSaving = createSelector(selectState, (s) => s.saving);
export const selectSubscriptionsError = createSelector(selectState, (s) => s.error);
