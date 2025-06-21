import { createActionGroup, props } from '@ngrx/store';
import { Client } from '../models';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const ClientActions = createActionGroup({
  source: 'Client',
  events: {
    // Load Clients
    'Load Clients': props<{ page?: number; limit?: number; search?: string }>(),
    'Load Clients Success': props<{ 
      data: Client[]; 
      total: number;
      page: number;
      totalPages: number;
    }>(),
    'Load Clients Failure': props<{ error: string }>(),

    // Create Client
    'Create Client': props<{ client: Omit<Client, '_id'> }>(),
    'Create Client Success': props<{ client: Client }>(),
    'Create Client Failure': props<{ error: string }>(),

    // Update Client
    'Update Client': props<{ id: string; update: Partial<Client> }>(),
    'Update Client Success': props<{ client: Client }>(),
    'Update Client Failure': props<{ error: string }>(),

    // Delete Client
    'Delete Client': props<{ id: string; page?: number }>(),
    'Delete Client Success': props<{ id: string; page?: number }>(),
    'Delete Client Failure': props<{ error: string }>(),

    // Search Clients
    'Search Clients': props<{ term: string }>(),
    'Search Clients Success': props<{ clients: Client[] }>(),
    'Search Clients Failure': props<{ error: string }>(),
  },
});
