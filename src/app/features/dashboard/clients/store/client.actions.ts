import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Client } from '../models';

export const ClientActions = createActionGroup({
  source: 'Client',
  events: {
    'Load Clients': emptyProps(),
    'Load Clients Success': props<{ data: Client[] }>(),
    'Load Clients Failure': props<{ error: Error }>(),

    'Create Client': props<{ client: Client }>(),
    'Create Client Success': props<{ client: Client }>(),
    'Create Client Failure': props<{ error: Error }>(),

    'Update Client': props<{ id: string; update: Partial<Client> }>(),
    'Update Client Success': props<{ client: Client }>(),
    'Update Client Failure': props<{ error: Error }>(),

    'Delete Client': props<{ id: string }>(),
    'Delete Client Success': props<{ data: Client[] }>(),
    'Delete Client Failure': props<{ error: Error }>(),

    'Search Clients': props<{ term: string }>(),
    'Search Clients Success': props<{ clients: Client[] }>(),
    'Search Clients Failure': props<{ error: Error }>(),
  },
});
