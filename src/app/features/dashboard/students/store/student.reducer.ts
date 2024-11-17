import { createFeature, createReducer, on } from '@ngrx/store';
import { StudentActions } from './student.actions';
import { Student } from '../models';

export const studentFeatureKey = 'student';

export interface State {
  students: Student[];
}

export const initialState: State = {
  students: [],
};

export const reducer = createReducer(
  initialState,
  on(StudentActions.loadStudents, (state) => {
    return {
      ...state,
    };
  }),
  on(StudentActions.loadStudentsSuccess, (state, action) => {
    return {
      ...state,
      students: action.data,
    };
  }),
  on(StudentActions.loadStudentsFailure, (state, error) => {
    return {
      ...state,
      error,
    };
  }),
  ////////// SECCION CREATE
  on(StudentActions.createStudentSuccess, (state, { student }) => ({
    ...state,
    students: [...state.students, student],
  })),
  on(StudentActions.createStudentFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  ////////// SECCION UPDATE
  on(StudentActions.updateStudent, (state) => {
    return {
      ...state,
    };
  }),
  on(StudentActions.updateStudentSuccess, (state, { student }) => {
    return {
      ...state,
      students: state.students.map((c) => (c.id === student.id ? student : c)),
    };
  }),
  on(StudentActions.updateStudentFailure, (state, { error }) => {
    return {
      ...state,
      error,
    };
  }),

  ////////// SECCION DELETE
  on(StudentActions.deleteStudent, (state, { id }) => ({
    ...state,
    students: state.students.filter((student) => student.id !== id),
  })),
  ////////// SECCION SEARCH

  on(StudentActions.searchStudents, (state) => {
    return { ...state };
  }),
  on(StudentActions.searchStudentsSuccess, (state, { students }) => {
    return {
      ...state,
      students,
    };
  }),
  on(StudentActions.searchStudentsFailure, (state, { error }) => {
    return {
      ...state,
    };
  })
);

export const studentFeature = createFeature({
  name: studentFeatureKey,
  reducer,
});
