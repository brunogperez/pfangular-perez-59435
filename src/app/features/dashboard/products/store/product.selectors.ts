import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromProduct from './product.reducer';
import { Product } from '../models';

export const selectProductState = createFeatureSelector<fromProduct.State>(
  fromProduct.productFeatureKey
);

export const selectProduct = createSelector(
  selectProductState,
  (state) => state.products
);

export const selectProductById = (id: string) => 
  createSelector(
    selectProductState,
    (state): Product | undefined => state.products.find(product => product.id === id)
  );
