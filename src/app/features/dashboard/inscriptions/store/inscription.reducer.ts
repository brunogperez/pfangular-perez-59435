import { createFeature, createReducer, on, Action } from '@ngrx/store';
import { InscriptionActions } from './inscription.actions';
import { Inscription } from '../models';
import { Product } from '../../products/models/index';
import { Client } from '../../clients/models';
import { generateRandomString } from '../../../../shared/utils';
import { HttpErrorResponse } from '@angular/common/http';

export const inscriptionFeatureKey = 'inscription';

export interface State {
  isLoadingInscription: boolean;
  loadInscriptionError: Error | null | HttpErrorResponse;
  inscriptions: Inscription[];
  selectedProductId: string | null;
}

export const initialState: State = {
  isLoadingInscription: false,
  loadInscriptionError: null,
  inscriptions: [],
  selectedProductId: null,
};

export const reducer = createReducer(
  initialState,
  ////////// SECCION LOAD
  on(InscriptionActions.loadInscriptions, (state) => {
    return {
      ...state,
      isLodingInscription: true,
    };
  }),
  on(InscriptionActions.loadInscriptionsSuccess, (state, action) => {
    return {
      ...state,

      inscriptions: action.data,
      isLodingInscription: false,
      loadInscriptionError: null,
    };
  }),
  on(InscriptionActions.loadInscriptionsFailure, (state, action) => {
    return {
      ...state,

      loadInscriptionError: action.error,
      isLodingInscription: false,
    };
  }),
  ////////// SECCION LOADBYCOURSE
  on(InscriptionActions.loadInscriptionsByProduct, (state) => {
    return {
      ...state,
    };
  }),
  on(InscriptionActions.loadInscriptionsByProductSuccess, (state, action) => {
    return {
      ...state,
      inscriptions: action.data,
    };
  }),
  on(InscriptionActions.loadInscriptionsByProductFailure, (state, error) => {
    return {
      ...state,
      error,
    };
  }),
  ////////// SECCION CREATE
  on(InscriptionActions.createInscription, (state, action) => {
    return {
      ...state,
      inscriptions: [
        ...state.inscriptions,
        {
          id: generateRandomString(25),
          productId: action.productId,
          clientId: action.clientId,
        },
      ],
    };
  }),

  ////////// SECCION DELETE
  on(InscriptionActions.deleteInscription, (state, action) => ({
    ...state,
    inscriptions: state.inscriptions.filter(
      (insciption) => insciption.clientId !== action.id
    ),
  }))
);

export const inscriptionFeature = createFeature({
  name: inscriptionFeatureKey,
  reducer,
});
