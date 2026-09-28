import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  CreditOperationPayload,
  CreditTransaction,
  Reseller,
  ResellerCreatePayload,
  ResellerUpdatePayload,
} from '../../core/models';

export const ResellersActions = createActionGroup({
  source: 'Resellers',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ resellers: Reseller[] }>(),
    'Load Failure': props<{ error: string }>(),

    'Create': props<{ payload: ResellerCreatePayload }>(),
    'Create Success': props<{ reseller: Reseller }>(),
    'Create Failure': props<{ error: string }>(),

    'Update': props<{ id: string; payload: ResellerUpdatePayload }>(),
    'Update Success': props<{ reseller: Reseller }>(),
    'Update Failure': props<{ error: string }>(),

    'Delete': props<{ id: string }>(),
    'Delete Success': props<{ id: string }>(),
    'Delete Failure': props<{ error: string }>(),

    'Topup': props<{ id: string; payload: CreditOperationPayload }>(),
    'Topup Success': props<{ reseller: Reseller; transaction: CreditTransaction }>(),
    'Topup Failure': props<{ error: string }>(),

    'Adjust': props<{ id: string; payload: CreditOperationPayload }>(),
    'Adjust Success': props<{ reseller: Reseller; transaction: CreditTransaction }>(),
    'Adjust Failure': props<{ error: string }>(),
  },
});
