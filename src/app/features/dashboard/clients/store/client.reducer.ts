import { createFeature, createReducer, on } from '@ngrx/store';
import { ClientActions } from './client.actions';
import { Client } from '../models';

export const clientFeatureKey = 'client';

export interface State {
  clients: Client[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchTerm: string;
}

export const initialState: State = {
  clients: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  searchTerm: '',
};

export const reducer = createReducer(
  initialState,
  // Load Clients
  on(ClientActions.loadClients, (state, { page = 1, limit = 10, search = '' }) => ({
    ...state,
    loading: true,
    error: null,
    searchTerm: search,
    pagination: {
      ...state.pagination,
      page,
      limit,
    },
  })),
  
  on(ClientActions.loadClientsSuccess, (state, { data, total, page, totalPages }) => ({
    ...state,
    loading: false,
    clients: data,
    pagination: {
      ...state.pagination,
      total,
      page,
      totalPages,
    },
  })),
  
  on(ClientActions.loadClientsFailure, (state, { error }) => ({
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
    pagination: {
      ...state.pagination,
      total: state.pagination.total + 1,
    },
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
    pagination: {
      ...state.pagination,
      total: Math.max(0, state.pagination.total - 1),
    },
  })),
  
  on(ClientActions.deleteClientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Search Clients
  on(ClientActions.searchClients, (state, { term }) => ({
    ...state,
    loading: true,
    searchTerm: term,
    error: null,
  })),
  
  on(ClientActions.searchClientsSuccess, (state, { clients }) => ({
    ...state,
    loading: false,
    clients,
  })),
  
  on(ClientActions.searchClientsFailure, (state, { error }) => ({
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
export const selectPagination = (state: State) => state.pagination;
export const selectSearchTerm = (state: State) => state.searchTerm;
