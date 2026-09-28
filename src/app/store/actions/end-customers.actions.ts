import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  EndCustomer,
  EndCustomerCreatePayload,
  EndCustomerUpdatePayload,
} from '../../core/models';

export interface EndCustomersFilter {
  reseller?: string;
  active?: boolean;
}

export const EndCustomersActions = createActionGroup({
  source: 'EndCustomers',
  events: {
    'Set Filter': props<{ filter: EndCustomersFilter }>(),

    'Load': emptyProps(),
    'Load Success': props<{ customers: EndCustomer[] }>(),
    'Load Failure': props<{ error: string }>(),

    'Create': props<{ payload: EndCustomerCreatePayload }>(),
    'Create Success': props<{ customer: EndCustomer }>(),
    'Create Failure': props<{ error: string }>(),

    'Update': props<{ id: string; payload: EndCustomerUpdatePayload }>(),
    'Update Success': props<{ customer: EndCustomer }>(),
    'Update Failure': props<{ error: string }>(),

    'Delete': props<{ id: string }>(),
    'Delete Success': props<{ id: string }>(),
    'Delete Failure': props<{ error: string }>(),
  },
});
