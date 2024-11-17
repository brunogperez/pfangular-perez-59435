import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromInscription from './inscription.reducer';

export const selectInscriptionState =
  createFeatureSelector<fromInscription.State>(
    fromInscription.inscriptionFeatureKey
  );

export const selectorInscriptions = createSelector(
  selectInscriptionState,
  (state) => state.inscriptions
);
export const selectorInscriptionsByCourse = createSelector(
  selectInscriptionState,
  (state) => state.inscriptions
);


export const selectorInscriptionError = createSelector(
  selectInscriptionState,
  (state)=> state.loadInscriptionError,
)
export const selectorIsLoadingInscriptions = createSelector(
  selectInscriptionState,
  (state)=> state.isLoadingInscription,
)