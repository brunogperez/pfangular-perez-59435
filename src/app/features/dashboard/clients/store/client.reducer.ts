import { createFeature, createReducer, on } from '@ngrx/store';
import { ClientActions } from './client.actions';
import { Client } from '../models';

export const clientFeatureKey = 'client';

export interface State {
  clients: Client[];
  client: Client;
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

export const initialState: State = {
  clients: [],
  client: {} as Client,
  loading: false,
  error: null,
  searchTerm: '',
};

export const reducer = createReducer(
  initialState,
  // Load Clients
  on(ClientActions.loadClients, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ClientActions.loadClientsSuccess, (state, { clients }) => ({
    ...state,
    loading: false,
    clients,
  })),
  
  on(ClientActions.loadClientsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ClientActions.loadClientById, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(ClientActions.loadClientByIdSuccess, (state, { client }) => ({
    ...state,
    loading: false,
    client,
  })),

  on(ClientActions.loadClientByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create Client
  on(ClientActions.createClient, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ClientActions.createClientSuccess, (state, { client }) => ({
    ...state,
    loading: false,
    clients: [...state.clients, client],
  })),
  
  on(ClientActions.createClientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Client
  on(ClientActions.updateClient, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ClientActions.updateClientSuccess, (state, { client }) => ({
    ...state,
    loading: false,
    clients: state.clients.map((c) => (c._id === client._id ? client : c)),
  })),
  
  on(ClientActions.updateClientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete Client
  on(ClientActions.deleteClient, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ClientActions.deleteClientSuccess, (state, { id }) => ({
    ...state,
    loading: false,
    clients: state.clients.filter((client) => client._id !== id),
  })),
  
  on(ClientActions.deleteClientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

export const clientFeature = createFeature({
  name: clientFeatureKey,
  reducer,
});

// Selectors
export const selectClients = (state: State) => state.clients;
export const selectLoading = (state: State) => state.loading;
export const selectError = (state: State) => state.error;
export const selectSearchTerm = (state: State) => state.searchTerm;
