import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Client } from '../models';

export const ClientActions = createActionGroup({
  source: 'Client',
  events: {
    // Load Clients
    'Load Clients': emptyProps(),
    'Load Clients Success': props<{ clients: Client[] }>(),
    'Load Clients Failure': props<{ error: string }>(),

    // Load Client By Id
    'Load Client By Id': props<{ id: string }>(),
    'Load Client By Id Success': props<{ client: Client }>(),
    'Load Client By Id Failure': props<{ error: string }>(),

    // Create Client
    'Create Client': props<{ client: Omit<Client, '_id'> }>(),
    'Create Client Success': props<{ client: Client }>(),
    'Create Client Failure': props<{ error: string }>(),

    // Update Client
    'Update Client': props<{ id: string; update: Partial<Client> }>(),
    'Update Client Success': props<{ client: Client }>(),
    'Update Client Failure': props<{ error: string }>(),

    // Delete Client
    'Delete Client': props<{ id: string }>(),
    'Delete Client Success': props<{ id: string }>(),
    'Delete Client Failure': props<{ error: string }>(),
  },
});
