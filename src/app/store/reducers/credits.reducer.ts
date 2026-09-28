import { createReducer, on } from '@ngrx/store';
import { CreditTransaction } from '../../core/models';
import { CreditsActions, CreditsFilter } from '../actions/credits.actions';

export const creditsFeatureName = 'credits';

export interface CreditsState {
  items: CreditTransaction[];
  filter: CreditsFilter;
  loading: boolean;
  error: string | null;
}

const initialState: CreditsState = {
  items: [],
  filter: { limit: 200 },
  loading: false,
  error: null,
};

export const creditsReducer = createReducer(
  initialState,
  on(CreditsActions.setFilter, (state, { filter }) => ({
    ...state,
    filter: { ...state.filter, ...filter },
  })),

  on(CreditsActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(CreditsActions.loadSuccess, (state, { transactions }) => ({
    ...state,
    items: transactions,
    loading: false,
  })),
  on(CreditsActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
