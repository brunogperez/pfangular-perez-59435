import { createReducer, on } from '@ngrx/store';
import { Reseller } from '../../core/models';
import { ResellersActions } from '../actions/resellers.actions';

export const resellersFeatureName = 'resellers';

export interface ResellersState {
  items: Reseller[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ResellersState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
};

const idOf = (r: Reseller): string => r._id ?? r.id ?? '';

const upsert = (items: Reseller[], updated: Reseller): Reseller[] => {
  const targetId = idOf(updated);
  const idx = items.findIndex((r) => idOf(r) === targetId);
  if (idx === -1) return [...items, updated];
  const copy = [...items];
  copy[idx] = updated;
  return copy;
};

export const resellersReducer = createReducer(
  initialState,
  on(ResellersActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(ResellersActions.loadSuccess, (state, { resellers }) => ({
    ...state,
    items: resellers,
    loading: false,
  })),
  on(ResellersActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ResellersActions.create, ResellersActions.update, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(ResellersActions.createSuccess, (state, { reseller }) => ({
    ...state,
    items: upsert(state.items, reseller),
    saving: false,
  })),
  on(ResellersActions.updateSuccess, (state, { reseller }) => ({
    ...state,
    items: upsert(state.items, reseller),
    saving: false,
  })),
  on(
    ResellersActions.createFailure,
    ResellersActions.updateFailure,
    (state, { error }) => ({ ...state, saving: false, error })
  ),

  on(ResellersActions.delete, (state) => ({ ...state, saving: true, error: null })),
  on(ResellersActions.deleteSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((r) => idOf(r) !== id),
    saving: false,
  })),
  on(ResellersActions.deleteFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),

  on(ResellersActions.topup, ResellersActions.adjust, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(
    ResellersActions.topupSuccess,
    ResellersActions.adjustSuccess,
    (state, { reseller }) => ({
      ...state,
      items: upsert(state.items, reseller),
      saving: false,
    })
  ),
  on(
    ResellersActions.topupFailure,
    ResellersActions.adjustFailure,
    (state, { error }) => ({ ...state, saving: false, error })
  )
);
