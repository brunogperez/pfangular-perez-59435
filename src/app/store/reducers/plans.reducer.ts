import { createReducer, on } from '@ngrx/store';
import { Plan } from '../../core/models';
import { PlansActions, PlansFilter } from '../actions/plans.actions';

export const plansFeatureName = 'plans';

export interface PlansState {
  items: Plan[];
  serviceTypes: string[];
  filter: PlansFilter;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: PlansState = {
  items: [],
  serviceTypes: [],
  filter: {},
  loading: false,
  saving: false,
  error: null,
};

const idOf = (p: Plan): string => p._id ?? p.id ?? '';

const upsert = (items: Plan[], updated: Plan): Plan[] => {
  const target = idOf(updated);
  const idx = items.findIndex((p) => idOf(p) === target);
  if (idx === -1) return [...items, updated];
  const copy = [...items];
  copy[idx] = updated;
  return copy;
};

export const plansReducer = createReducer(
  initialState,
  on(PlansActions.setFilter, (state, { filter }) => ({ ...state, filter })),

  on(PlansActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(PlansActions.loadSuccess, (state, { plans }) => ({
    ...state,
    items: plans,
    loading: false,
  })),
  on(PlansActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlansActions.loadServiceTypesSuccess, (state, { serviceTypes }) => ({
    ...state,
    serviceTypes,
  })),

  on(PlansActions.create, PlansActions.update, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(PlansActions.createSuccess, (state, { plan }) => ({
    ...state,
    items: upsert(state.items, plan),
    saving: false,
  })),
  on(PlansActions.updateSuccess, (state, { plan }) => ({
    ...state,
    items: upsert(state.items, plan),
    saving: false,
  })),
  on(
    PlansActions.createFailure,
    PlansActions.updateFailure,
    (state, { error }) => ({ ...state, saving: false, error })
  ),

  on(PlansActions.delete, (state) => ({ ...state, saving: true, error: null })),
  on(PlansActions.deleteSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((p) => idOf(p) !== id),
    saving: false,
  })),
  on(PlansActions.deleteFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  }))
);
