import { createFeature, createReducer, on, Action } from '@ngrx/store';
import { InscriptionActions } from './inscription.actions';
import { Inscription } from '../models';
import { Course } from '../../courses/models/index';
import { Student } from '../../students/models';
import { generateRandomString } from '../../../../shared/utils';
import { HttpErrorResponse } from '@angular/common/http';

export const inscriptionFeatureKey = 'inscription';

export interface State {
  isLoadingInscription: boolean;
  loadInscriptionError: Error | null | HttpErrorResponse;
  inscriptions: Inscription[];
  selectedCourseId: string | null;
}

export const initialState: State = {
  isLoadingInscription: false,
  loadInscriptionError: null,
  inscriptions: [],
  selectedCourseId: null,
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
  on(InscriptionActions.loadInscriptionsByCourse, (state) => {
    return {
      ...state,
    };
  }),
  on(InscriptionActions.loadInscriptionsByCourseSuccess, (state, action) => {
    return {
      ...state,
      inscriptions: action.data,
    };
  }),
  on(InscriptionActions.loadInscriptionsByCourseFailure, (state, error) => {
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
          courseId: action.courseId,
          studentId: action.studentId,
        },
      ],
    };
  }),

  ////////// SECCION DELETE
  on(InscriptionActions.deleteInscription, (state, action) => ({
    ...state,
    inscriptions: state.inscriptions.filter(
      (insciption) => insciption.studentId !== action.id
    ),
  }))
);

export const inscriptionFeature = createFeature({
  name: inscriptionFeatureKey,
  reducer,
});
