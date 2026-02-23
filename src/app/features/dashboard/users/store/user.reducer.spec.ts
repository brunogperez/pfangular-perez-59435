import { reducer, initialState, State } from './user.reducer';
import { UserActions } from './user.actions';
import { User } from '../models';

const mockUser: User = {
  _id: 'u1',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@mail.com',
  role: 'admin',
  token: 'token123',
};

const mockUser2: User = {
  _id: 'u2',
  firstName: 'Regular',
  lastName: 'User',
  email: 'user@mail.com',
  role: 'user',
  token: 'token456',
};

describe('User Reducer', () => {
  it('debe retornar el estado inicial', () => {
    const action = { type: 'Unknown' } as any;
    const state = reducer(undefined, action);
    expect(state).toEqual(initialState);
  });

  // Load Users
  it('loadUsers debe retornar el estado actual', () => {
    const action = UserActions.loadUsers();
    const state = reducer(initialState, action);
    expect(state).toEqual(initialState);
  });

  it('loadUsersSuccess debe cargar los usuarios', () => {
    const users = [mockUser, mockUser2];
    const action = UserActions.loadUsersSuccess({ data: users });
    const state = reducer(initialState, action);
    expect(state.users).toEqual(users);
  });

  it('loadUsersFailure debe establecer el error', () => {
    const error = new Error('Error de red');
    const action = UserActions.loadUsersFailure({ error });
    const state = reducer(initialState, action);
    expect((state as any).error).toBeTruthy();
  });

  // Load User By Id
  it('loadUserByIdSuccess debe cargar el usuario', () => {
    const action = UserActions.loadUserByIdSuccess({ data: mockUser });
    const state = reducer(initialState, action);
    expect(state.user).toEqual(mockUser);
  });

  // Create User
  it('createUserSuccess debe agregar el usuario a la lista', () => {
    const prevState: State = { ...initialState, users: [mockUser] };
    const action = UserActions.createUserSuccess({ user: mockUser2 });
    const state = reducer(prevState, action);
    expect(state.users.length).toBe(2);
    expect(state.users[1]).toEqual(mockUser2);
  });

  // Update User
  it('updateUserSuccess debe actualizar el usuario en la lista', () => {
    const updatedUser = { ...mockUser, firstName: 'Updated' };
    const prevState: State = { ...initialState, users: [mockUser, mockUser2] };
    const action = UserActions.updateUserSuccess({ user: updatedUser });
    const state = reducer(prevState, action);
    expect(state.users[0].firstName).toBe('Updated');
    expect(state.users[1]).toEqual(mockUser2);
  });

  // Delete User
  it('deleteUser debe remover el usuario de la lista', () => {
    const prevState: State = { ...initialState, users: [mockUser, mockUser2] };
    const action = UserActions.deleteUser({ id: 'u1' });
    const state = reducer(prevState, action);
    expect(state.users.length).toBe(1);
    expect(state.users[0]._id).toBe('u2');
  });
});
