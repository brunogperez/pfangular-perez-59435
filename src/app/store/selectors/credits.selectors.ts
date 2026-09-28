import { createFeatureSelector, createSelector } from '@ngrx/store';
import { creditsFeatureName, CreditsState } from '../reducers/credits.reducer';

const selectState = createFeatureSelector<CreditsState>(creditsFeatureName);

export const selectCredits = createSelector(selectState, (s) => s.items);
export const selectCreditsFilter = createSelector(selectState, (s) => s.filter);
export const selectCreditsLoading = createSelector(selectState, (s) => s.loading);
export const selectCreditsError = createSelector(selectState, (s) => s.error);

export const selectFilteredCredits = createSelector(
  selectCredits,
  selectCreditsFilter,
  (items, filter) => {
    let out = items;
    if (filter.fromDate) {
      const from = new Date(filter.fromDate).getTime();
      out = out.filter((t) => (t.createdAt ? new Date(t.createdAt).getTime() >= from : true));
    }
    if (filter.toDate) {
      const to = new Date(filter.toDate).getTime() + 24 * 60 * 60 * 1000 - 1;
      out = out.filter((t) => (t.createdAt ? new Date(t.createdAt).getTime() <= to : true));
    }
    return out;
  }
);
