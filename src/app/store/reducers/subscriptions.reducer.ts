import { createReducer, on } from '@ngrx/store';
import { Subscription, SubscriptionStats } from '../../core/models';
import {
  SubscriptionsActions,
  SubscriptionsFilter,
} from '../actions/subscriptions.actions';

export const subscriptionsFeatureName = 'subscriptions';

export interface SubscriptionsState {
  items: Subscription[];
  stats: SubscriptionStats | null;
  filter: SubscriptionsFilter;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = {
  items: [],
  stats: null,
  filter: {},
  loading: false,
  saving: false,
  error: null,
};

const idOf = (s: Subscription): string => s._id ?? s.id ?? '';

const upsert = (items: Subscription[], updated: Subscription): Subscription[] => {
  const target = idOf(updated);
  const idx = items.findIndex((s) => idOf(s) === target);
  if (idx === -1) return [...items, updated];
  const copy = [...items];
  copy[idx] = updated;
  return copy;
};

export const subscriptionsReducer = createReducer(
  initialState,
  on(SubscriptionsActions.setFilter, (state, { filter }) => ({ ...state, filter })),

  on(SubscriptionsActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(SubscriptionsActions.loadSuccess, (state, { subscriptions }) => ({
    ...state,
    items: subscriptions,
    loading: false,
  })),
  on(SubscriptionsActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SubscriptionsActions.loadStatsSuccess, (state, { stats }) => ({ ...state, stats })),

  on(
    SubscriptionsActions.create,
    SubscriptionsActions.update,
    SubscriptionsActions.renew,
    SubscriptionsActions.cancel,
    (state) => ({ ...state, saving: true, error: null })
  ),
  on(
    SubscriptionsActions.createSuccess,
    SubscriptionsActions.updateSuccess,
    SubscriptionsActions.renewSuccess,
    SubscriptionsActions.cancelSuccess,
    (state, { subscription }) => ({
      ...state,
      items: upsert(state.items, subscription),
      saving: false,
    })
  ),
  on(
    SubscriptionsActions.createFailure,
    SubscriptionsActions.updateFailure,
    SubscriptionsActions.renewFailure,
    SubscriptionsActions.cancelFailure,
    (state, { error }) => ({ ...state, saving: false, error })
  ),

  on(SubscriptionsActions.delete, (state) => ({ ...state, saving: true, error: null })),
  on(SubscriptionsActions.deleteSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((s) => idOf(s) !== id),
    saving: false,
  })),
  on(SubscriptionsActions.deleteFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  }))
);
