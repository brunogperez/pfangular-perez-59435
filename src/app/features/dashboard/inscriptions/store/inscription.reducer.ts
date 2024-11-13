import { createFeature, createReducer, on } from '@ngrx/store';
import { InscriptionActions } from './inscription.actions';
import { Inscription } from '../models';
import { Course } from '../../courses/models/index';
import { Student } from '../../students/models';
import { generateRandomString } from '../../../../shared/utils';

export const inscriptionFeatureKey = 'inscription';

const SALES_DB: Inscription[] = [
  {
    id: 'sdUd24',
    courseId: 'asds',
    studentId: 'adasds',
  },
  {
    id: 'fdfds',
    courseId: 'vfgfdg',
    studentId: 'sdasdasd',
  },
];

const PRODUCTS_DB: Course[] = [
  {
    id: 'avcE2',
    name: 'PS5',
    duration: '2 months',
    level: 'Advanced',
    classes: [],
    description: '',
  },
  {
    id: 'av22321312',
    name: 'PS2',
    duration: '2 months',
    level: 'Advanced',
    classes: [],
    description: '',
  },
];

const USER_DB: Student[] = [
  {
    id: '4d22',
    firstName: 'Josue',
    lastName: 'Baez',
    email: 'jbaez@mail.com',
    createdAt: new Date('2024-10-24T00:14:33.140Z'),
    birthdate: new Date('2024-10-24T00:14:33.140Z'),
  },
  {
    id: 'Fr24',
    firstName: 'Naruto',
    lastName: 'Uzumaki',
    email: 'naru@mail.com',
    createdAt: new Date('2024-10-24T00:14:33.140Z'),
    birthdate: new Date('2024-10-24T00:14:33.140Z'),
  },
];

export interface State {
  inscriptions: Inscription[];
  courseOptions: Course[];
  studentOptions: Student[];
}

export const initialState: State = {
  inscriptions: [],
  courseOptions: [],
  studentOptions: [],
};

export const reducer = createReducer(
  initialState,
  on(InscriptionActions.loadInscriptions, (state) => {
    return {
      ...state,
      inscriptions: [...SALES_DB],
    };
  }),
  on(InscriptionActions.loadCourseOptions, (state) => {
    return {
      ...state,
      courseOptions: [...PRODUCTS_DB],
    };
  }),
  on(InscriptionActions.loadStrudentOptions, (state) => {
    return {
      ...state,
      studentOptions: [...USER_DB],
    };
  }),
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
  })
);

export const inscriptionFeature = createFeature({
  name: inscriptionFeatureKey,
  reducer,
});
