import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCourse from './course.reducer';
import { Course } from '../models';

export const selectCourseState = createFeatureSelector<fromCourse.State>(
  fromCourse.courseFeatureKey
);

export const selectCourse = createSelector(
  selectCourseState,
  (state) => state.courses
);

export const selectCourseById = (id: string) => 
  createSelector(
    selectCourseState,
    (state): Course | undefined => state.courses.find(course => course.id === id)
  );
