import { createFeature, createReducer, on } from '@ngrx/store';
import { CourseActions } from './course.actions';
import { Course } from '../models';

export const courseFeatureKey = 'course';

export interface State {
  courses: Course[];
  course: Course;
  loadCourseError: Error | null;
}

export const initialState: State = {
  course: {} as Course,
  courses: [],
  loadCourseError: null,
};

export const reducer = createReducer(
  initialState,

  ////////// SECCION LOAD
  on(CourseActions.loadCourses, (state) => {
    return {
      ...state,
    };
  }),
  on(CourseActions.loadCoursesSuccess, (state, action) => {
    return {
      ...state,
      courses: action.data,
    };
  }),
  on(CourseActions.loadCoursesFailure, (state, action) => {
    return {
      ...state,
      loadCourseError: action.error,
    };
  }),
  on(CourseActions.loadCourseById, (state) => {
    return {
      ...state,
    };
  }),
  on(CourseActions.loadCourseByIdSuccess, (state, { data: course }) => {
    return {
      ...state,
      course,
    };
  }),
  on(CourseActions.loadCourseByIdFailure, (state, error) => {
    return {
      ...state,
      error,
    };
  }),

  ////////// SECCION CREATE
  on(CourseActions.createCourseSuccess, (state, { course }) => ({
    ...state,
    courses: [...state.courses, course],
  })),
  on(CourseActions.createCourseFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  ////////// SECCION UPDATE
  on(CourseActions.updateCourse, (state) => {
    return {
      ...state,
    };
  }),
  on(CourseActions.updateCourseSuccess, (state, { course }) => {
    return {
      ...state,
      courses: state.courses.map((c) => (c.id === course.id ? course : c)),
    };
  }),
  on(CourseActions.updateCourseFailure, (state, { error }) => {
    return {
      ...state,
      error,
    };
  }),

  ////////// SECCION DELETE
  on(CourseActions.deleteCourse, (state, { id }) => ({
    ...state,
    courses: state.courses.filter((course) => course.id !== id),
  }))
);

export const courseFeature = createFeature({
  name: courseFeatureKey,
  reducer,
});
