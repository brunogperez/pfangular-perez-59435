import { createReducer, on } from '@ngrx/store';
import { EndCustomer } from '../../core/models';
import {
  EndCustomersActions,
  EndCustomersFilter,
} from '../actions/end-customers.actions';

export const endCustomersFeatureName = 'endCustomers';

export interface EndCustomersState {
  items: EndCustomer[];
  filter: EndCustomersFilter;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: EndCustomersState = {
  items: [],
  filter: {},
  loading: false,
  saving: false,
  error: null,
};

const idOf = (c: EndCustomer): string => c._id ?? c.id ?? '';

const upsert = (items: EndCustomer[], updated: EndCustomer): EndCustomer[] => {
  const target = idOf(updated);
  const idx = items.findIndex((c) => idOf(c) === target);
  if (idx === -1) return [...items, updated];
  const copy = [...items];
  copy[idx] = updated;
  return copy;
};

export const endCustomersReducer = createReducer(
  initialState,
  on(EndCustomersActions.setFilter, (state, { filter }) => ({
    ...state,
    filter,
  })),

  on(EndCustomersActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(EndCustomersActions.loadSuccess, (state, { customers }) => ({
    ...state,
    items: customers,
    loading: false,
  })),
  on(EndCustomersActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(EndCustomersActions.create, EndCustomersActions.update, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(EndCustomersActions.createSuccess, (state, { customer }) => ({
    ...state,
    items: upsert(state.items, customer),
    saving: false,
  })),
  on(EndCustomersActions.updateSuccess, (state, { customer }) => ({
    ...state,
    items: upsert(state.items, customer),
    saving: false,
  })),
  on(
    EndCustomersActions.createFailure,
    EndCustomersActions.updateFailure,
    (state, { error }) => ({ ...state, saving: false, error })
  ),

  on(EndCustomersActions.delete, (state) => ({ ...state, saving: true, error: null })),
  on(EndCustomersActions.deleteSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((c) => idOf(c) !== id),
    saving: false,
  })),
  on(EndCustomersActions.deleteFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  }))
);
