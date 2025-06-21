import { createFeature, createReducer, on } from '@ngrx/store';
import { ClientActions } from './client.actions';
import { Client } from '../models';

export const clientFeatureKey = 'client';

export interface State {
  clients: Client[];
}

export const initialState: State = {
  clients: [],
};

export const reducer = createReducer(
  initialState,
  on(ClientActions.loadClients, (state) => {
    return {
      ...state,
    };
  }),
  on(ClientActions.loadClientsSuccess, (state, action) => {
    return {
      ...state,
      clients: action.data,
    };
  }),
  on(ClientActions.loadClientsFailure, (state, error) => {
    return {
      ...state,
      error,
    };
  }),
  ////////// SECCION CREATE
  on(ClientActions.createClientSuccess, (state, { client }) => ({
    ...state,
    clients: [...state.clients, client],
  })),
  on(ClientActions.createClientFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  ////////// SECCION UPDATE
  on(ClientActions.updateClient, (state) => {
    return {
      ...state,
    };
  }),
  on(ClientActions.updateClientSuccess, (state, { client }) => {
    return {
      ...state,
      clients: state.clients.map((c) => (c.id === client.id ? client : c)),
    };
  }),
  on(ClientActions.updateClientFailure, (state, { error }) => {
    return {
      ...state,
      error,
    };
  }),

  ////////// SECCION DELETE
  on(ClientActions.deleteClient, (state, { id }) => ({
    ...state,
    clients: state.clients.filter((client) => client.id !== id),
  })),
  ////////// SECCION SEARCH

  on(ClientActions.searchClients, (state) => {
    return { ...state };
  }),
  on(ClientActions.searchClientsSuccess, (state, { clients }) => {
    return {
      ...state,
      clients,
    };
  }),
  on(ClientActions.searchClientsFailure, (state, { error }) => {
    return {
      ...state,
    };
  })
);

export const clientFeature = createFeature({
  name: clientFeatureKey,
  reducer,
});
