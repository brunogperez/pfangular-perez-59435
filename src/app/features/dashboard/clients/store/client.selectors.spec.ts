import { selectorClients, selectorClientById, selectClientState } from './client.selectors';
import { State, initialState } from './client.reducer';
import { Client } from '../models';

const mockClient: Client = {
  _id: 'c1',
  firstName: 'Juan',
  lastName: 'Perez',
  email: 'juan@mail.com',
  birthdate: new Date('1990-01-01'),
};

const mockState: State = {
  ...initialState,
  clients: [mockClient],
  client: mockClient,
};

describe('Client Selectors', () => {
  it('selectClientState debe retornar el estado del feature client', () => {
    const result = selectClientState.projector(mockState);
    expect(result).toEqual(mockState);
  });

  it('selectorClients debe retornar la lista de clientes', () => {
    const result = selectorClients.projector(mockState);
    expect(result).toEqual([mockClient]);
  });

  it('selectorClientById debe retornar el cliente seleccionado', () => {
    const result = selectorClientById.projector(mockState);
    expect(result).toEqual(mockClient);
  });
});
