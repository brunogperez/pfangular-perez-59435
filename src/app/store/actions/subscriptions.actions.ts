import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  Subscription,
  SubscriptionCreatePayload,
  SubscriptionRenewPayload,
  SubscriptionStats,
  SubscriptionUpdatePayload,
} from '../../core/models';

export interface SubscriptionsFilter {
  status?: string;
  soldBy?: string;
  serviceType?: string;
  expiringInDays?: number;
}

export const SubscriptionsActions = createActionGroup({
  source: 'Subscriptions',
  events: {
    'Set Filter': props<{ filter: SubscriptionsFilter }>(),

    'Load': emptyProps(),
    'Load Success': props<{ subscriptions: Subscription[] }>(),
    'Load Failure': props<{ error: string }>(),

    'Load Stats': emptyProps(),
    'Load Stats Success': props<{ stats: SubscriptionStats }>(),
    'Load Stats Failure': props<{ error: string }>(),

    'Create': props<{ payload: SubscriptionCreatePayload }>(),
    'Create Success': props<{ subscription: Subscription }>(),
    'Create Failure': props<{ error: string }>(),

    'Update': props<{ id: string; payload: SubscriptionUpdatePayload }>(),
    'Update Success': props<{ subscription: Subscription }>(),
    'Update Failure': props<{ error: string }>(),

    'Renew': props<{ id: string; payload: SubscriptionRenewPayload }>(),
    'Renew Success': props<{ subscription: Subscription }>(),
    'Renew Failure': props<{ error: string }>(),

    'Cancel': props<{ id: string }>(),
    'Cancel Success': props<{ subscription: Subscription }>(),
    'Cancel Failure': props<{ error: string }>(),

    'Delete': props<{ id: string }>(),
    'Delete Success': props<{ id: string }>(),
    'Delete Failure': props<{ error: string }>(),
  },
});
