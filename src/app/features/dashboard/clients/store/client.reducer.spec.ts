import { reducer, initialState, State } from './client.reducer';
import { ClientActions } from './client.actions';
import { Client } from '../models';

const mockClient: Client = {
  _id: 'c1',
  firstName: 'Juan',
  lastName: 'Perez',
  email: 'juan@mail.com',
  birthdate: new Date('1990-01-01'),
};

const mockClient2: Client = {
  _id: 'c2',
  firstName: 'Maria',
  lastName: 'Lopez',
  email: 'maria@mail.com',
  birthdate: new Date('1995-05-15'),
};

describe('Client Reducer', () => {
  it('debe retornar el estado inicial', () => {
    const action = { type: 'Unknown' } as any;
    const state = reducer(undefined, action);
    expect(state).toEqual(initialState);
  });

  // Load Clients
  it('loadClients debe establecer loading en true', () => {
    const action = ClientActions.loadClients();
    const state = reducer(initialState, action);
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('loadClientsSuccess debe cargar los clientes y desactivar loading', () => {
    const clients = [mockClient, mockClient2];
    const action = ClientActions.loadClientsSuccess({ clients });
    const state = reducer({ ...initialState, loading: true }, action);
    expect(state.clients).toEqual(clients);
    expect(state.loading).toBeFalse();
  });

  it('loadClientsFailure debe establecer el error y desactivar loading', () => {
    const action = ClientActions.loadClientsFailure({ error: 'Error de red' });
    const state = reducer({ ...initialState, loading: true }, action);
    expect(state.error).toBe('Error de red');
    expect(state.loading).toBeFalse();
  });

  // Load Client By Id
  it('loadClientById debe establecer loading en true', () => {
    const action = ClientActions.loadClientById({ id: 'c1' });
    const state = reducer(initialState, action);
    expect(state.loading).toBeTrue();
  });

  it('loadClientByIdSuccess debe cargar el cliente', () => {
    const action = ClientActions.loadClientByIdSuccess({ client: mockClient });
    const state = reducer({ ...initialState, loading: true }, action);
    expect(state.client).toEqual(mockClient);
    expect(state.loading).toBeFalse();
  });

  it('loadClientByIdFailure debe establecer el error', () => {
    const action = ClientActions.loadClientByIdFailure({ error: 'No encontrado' });
    const state = reducer({ ...initialState, loading: true }, action);
    expect(state.error).toBe('No encontrado');
    expect(state.loading).toBeFalse();
  });

  // Create Client
  it('createClient debe establecer loading en true', () => {
    const action = ClientActions.createClient({ client: mockClient });
    const state = reducer(initialState, action);
    expect(state.loading).toBeTrue();
  });

  it('createClientSuccess debe agregar el cliente a la lista', () => {
    const prevState: State = { ...initialState, clients: [mockClient], loading: true };
    const action = ClientActions.createClientSuccess({ client: mockClient2 });
    const state = reducer(prevState, action);
    expect(state.clients.length).toBe(2);
    expect(state.clients[1]).toEqual(mockClient2);
    expect(state.loading).toBeFalse();
  });

  it('createClientFailure debe establecer el error', () => {
    const action = ClientActions.createClientFailure({ error: 'Error al crear' });
    const state = reducer({ ...initialState, loading: true }, action);
    expect(state.error).toBe('Error al crear');
    expect(state.loading).toBeFalse();
  });

  // Update Client
  it('updateClient debe establecer loading en true', () => {
    const action = ClientActions.updateClient({ id: 'c1', update: { firstName: 'Updated' } });
    const state = reducer(initialState, action);
    expect(state.loading).toBeTrue();
  });

  it('updateClientSuccess debe actualizar el cliente en la lista', () => {
    const updatedClient = { ...mockClient, firstName: 'Updated' };
    const prevState: State = { ...initialState, clients: [mockClient, mockClient2], loading: true };
    const action = ClientActions.updateClientSuccess({ client: updatedClient });
    const state = reducer(prevState, action);
    expect(state.clients[0].firstName).toBe('Updated');
    expect(state.clients[1]).toEqual(mockClient2);
    expect(state.loading).toBeFalse();
  });

  it('updateClientFailure debe establecer el error', () => {
    const action = ClientActions.updateClientFailure({ error: 'Error al actualizar' });
    const state = reducer({ ...initialState, loading: true }, action);
    expect(state.error).toBe('Error al actualizar');
  });

  // Delete Client
  it('deleteClient debe establecer loading en true', () => {
    const action = ClientActions.deleteClient({ id: 'c1' });
    const state = reducer(initialState, action);
    expect(state.loading).toBeTrue();
  });

  it('deleteClientSuccess debe remover el cliente de la lista', () => {
    const prevState: State = { ...initialState, clients: [mockClient, mockClient2], loading: true };
    const action = ClientActions.deleteClientSuccess({ id: 'c1' });
    const state = reducer(prevState, action);
    expect(state.clients.length).toBe(1);
    expect(state.clients[0]._id).toBe('c2');
    expect(state.loading).toBeFalse();
  });

  it('deleteClientFailure debe establecer el error', () => {
    const action = ClientActions.deleteClientFailure({ error: 'Error al eliminar' });
    const state = reducer({ ...initialState, loading: true }, action);
    expect(state.error).toBe('Error al eliminar');
  });
});
