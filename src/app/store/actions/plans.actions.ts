import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Plan, PlanCreatePayload, PlanUpdatePayload } from '../../core/models';

export interface PlansFilter {
  serviceType?: string;
  active?: boolean;
}

export const PlansActions = createActionGroup({
  source: 'Plans',
  events: {
    'Set Filter': props<{ filter: PlansFilter }>(),

    'Load': emptyProps(),
    'Load Success': props<{ plans: Plan[] }>(),
    'Load Failure': props<{ error: string }>(),

    'Load Service Types': emptyProps(),
    'Load Service Types Success': props<{ serviceTypes: string[] }>(),
    'Load Service Types Failure': props<{ error: string }>(),

    'Create': props<{ payload: PlanCreatePayload }>(),
    'Create Success': props<{ plan: Plan }>(),
    'Create Failure': props<{ error: string }>(),

    'Update': props<{ id: string; payload: PlanUpdatePayload }>(),
    'Update Success': props<{ plan: Plan }>(),
    'Update Failure': props<{ error: string }>(),

    'Delete': props<{ id: string }>(),
    'Delete Success': props<{ id: string }>(),
    'Delete Failure': props<{ error: string }>(),
  },
});
