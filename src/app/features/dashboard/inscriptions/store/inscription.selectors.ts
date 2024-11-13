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

export const selectorCourseOptions = createSelector(
  selectInscriptionState,
  (state)=>state.courseOptions
)
export const selectorStudentOptions = createSelector(
  selectInscriptionState,
  (state)=>state.studentOptions
)