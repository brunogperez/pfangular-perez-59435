import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCourse from './course.reducer';

export const selectCourseState = createFeatureSelector<fromCourse.State>(
  fromCourse.courseFeatureKey
);

export const selectCourse = createSelector(
  selectCourseState,
  (state) => state.courses
);
export const selectCourseById = createSelector(
  selectCourseState,
  (state) => state.course
);
