import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CreditTransaction, CreditTransactionType } from '../../core/models';

export interface CreditsFilter {
  reseller?: string;
  type?: CreditTransactionType;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export const CreditsActions = createActionGroup({
  source: 'Credits',
  events: {
    'Set Filter': props<{ filter: CreditsFilter }>(),

    'Load': emptyProps(),
    'Load Success': props<{ transactions: CreditTransaction[] }>(),
    'Load Failure': props<{ error: string }>(),
  },
});
