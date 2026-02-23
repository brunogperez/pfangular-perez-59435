import { selectorUsers, selectorUserById, selectUserState } from './user.selectors';
import { State, initialState } from './user.reducer';
import { User } from '../models';

const mockUser: User = {
  _id: 'u1',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@mail.com',
  role: 'admin',
};

const mockState: State = {
  ...initialState,
  users: [mockUser],
  user: mockUser,
};

describe('User Selectors', () => {
  it('selectUserState debe retornar el estado del feature user', () => {
    const result = selectUserState.projector(mockState);
    expect(result).toEqual(mockState);
  });

  it('selectorUsers debe retornar la lista de usuarios', () => {
    const result = selectorUsers.projector(mockState);
    expect(result).toEqual([mockUser]);
  });

  it('selectorUserById debe retornar el usuario seleccionado', () => {
    const result = selectorUserById.projector(mockState);
    expect(result).toEqual(mockUser);
  });
});
