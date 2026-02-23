import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { UserEffects } from './user.effects';
import { UserActions } from './user.actions';
import { UsersService } from '../../../../core/services/users.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MockProvider } from 'ng-mocks';
import { User } from '../models';
import { Action } from '@ngrx/store';

const mockUser: User = {
  _id: 'u1',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@mail.com',
  role: 'admin',
  token: 'token123',
};

const mockUsers: User[] = [mockUser];

describe('UserEffects', () => {
  let effects: UserEffects;
  let actions$: Observable<Action>;
  let usersService: UsersService;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideMockActions(() => actions$),
        MockProvider(UsersService, {
          getUsers: () => of(mockUsers),
          getUserById: () => of(mockUser),
          createUser: () => of(mockUser),
          updateUserById: () => of(mockUsers),
          removeUserById: () => of(mockUsers),
        }),
        MockProvider(NotificationService, {
          showSuccess: () => {},
          showError: () => {},
        }),
      ],
    });

    effects = TestBed.inject(UserEffects);
    usersService = TestBed.inject(UsersService);
    notificationService = TestBed.inject(NotificationService);
  });

  it('loadUsers$ debe cargar usuarios exitosamente', (done) => {
    actions$ = of(UserActions.loadUsers());
    (effects.loadUsers$ as any).subscribe((action: Action) => {
      expect(action).toEqual(UserActions.loadUsersSuccess({ data: mockUsers }));
      done();
    });
  });

  it('loadUsers$ debe manejar error', (done) => {
    const error = new Error('Network error');
    spyOn(usersService, 'getUsers').and.returnValue(throwError(() => error));
    actions$ = of(UserActions.loadUsers());
    (effects.loadUsers$ as any).subscribe((action: Action) => {
      expect(action).toEqual(UserActions.loadUsersFailure({ error }));
      done();
    });
  });

  it('loadUserById$ debe cargar un usuario por id', (done) => {
    actions$ = of(UserActions.loadUserById({ id: 'u1' }));
    (effects.loadUserById$ as any).subscribe((action: Action) => {
      expect(action).toEqual(UserActions.loadUserByIdSuccess({ data: mockUser }));
      done();
    });
  });

  it('createUsers$ debe crear un usuario y mostrar notificación', (done) => {
    spyOn(notificationService, 'showSuccess');
    actions$ = of(UserActions.createUser({ user: mockUser }));
    (effects.createUsers$ as any).subscribe((action: Action) => {
      expect(action).toEqual(UserActions.createUserSuccess({ user: mockUser }));
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Usuario creado exitosamente.'
      );
      done();
    });
  });

  it('createUsers$ debe manejar error y mostrar notificación', (done) => {
    const error = new Error('Create error');
    spyOn(usersService, 'createUser').and.returnValue(throwError(() => error));
    spyOn(notificationService, 'showError');
    actions$ = of(UserActions.createUser({ user: mockUser }));
    (effects.createUsers$ as any).subscribe((action: Action) => {
      expect(action).toEqual(UserActions.createUserFailure({ error }));
      expect(notificationService.showError).toHaveBeenCalledWith(
        'No se pudo crear el usuario.'
      );
      done();
    });
  });

  it('loadUsersAfterUpdate$ debe recargar despues de update', (done) => {
    actions$ = of(UserActions.updateUserSuccess({ user: mockUser }));
    (effects.loadUsersAfterUpdate$ as any).subscribe((action: Action) => {
      expect(action).toEqual(UserActions.loadUsers());
      done();
    });
  });
});
