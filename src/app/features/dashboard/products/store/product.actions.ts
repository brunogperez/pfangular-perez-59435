import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Product } from '../models';

export const ProductActions = createActionGroup({
  source: 'Product',
  events: {
    'Load Products': emptyProps(),
    'Load Products Success': props<{ data: Product[] }>(),
    'Load Products Failure': props<{ error: Error }>(),

    'Load Product By Id': props<{ id: string }>(),
    'Load Product By Id Success': props<{ data: Product }>(),
    'Load Product By Id Failure': props<{ error: Error }>(),

    'Create Product': props<{ product: Product }>(),
    'Create Product Success': props<{ product: Product }>(),
    'Create Product Failure': props<{ error: Error }>(),

    'Update Product': props<{ id: string; update: Partial<Product> }>(),
    'Update Product Success': props<{ product: Product }>(),
    'Update Product Failure': props<{ error: Error }>(),

    'Delete Product': props<{ id: string }>(),
    'Delete Product Success': props<{ data: Product[] }>(),
    'Delete Product Failure': props<{ error: Error }>(),
  },
});