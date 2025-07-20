import { createFeature, createReducer, on } from '@ngrx/store';
import { ProductActions } from './product.actions';
import { Product } from '../models';

export const productFeatureKey = 'product';

export interface State {
  products: Product[];
  product: Product;
  loadProductError: Error | null;
}

export const initialState: State = {
  product: {} as Product,
  products: [],
  loadProductError: null,
};

export const reducer = createReducer(
  initialState,

  ////////// SECCION LOAD
  on(ProductActions.loadProducts, (state) => {
    return {
      ...state,
    };
  }),
  on(ProductActions.loadProductsSuccess, (state, action) => {
    return {
      ...state,
      products: action.data,
    };
  }),
  on(ProductActions.loadProductsFailure, (state, action) => {
    return {
      ...state,
      loadProductError: action.error,
    };
  }),
  on(ProductActions.loadProductById, (state) => {
    return {
      ...state,
    };
  }),
  on(ProductActions.loadProductByIdSuccess, (state, { data: product }) => {
    return {
      ...state,
      product,
    };
  }),
  on(ProductActions.loadProductByIdFailure, (state, error) => {
    return {
      ...state,
      error,
    };
  }),

  ////////// SECCION CREATE
  on(ProductActions.createProductSuccess, (state, { product }) => ({
    ...state,
    products: [...state.products, product],
  })),
  on(ProductActions.createProductFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  ////////// SECCION UPDATE
  on(ProductActions.updateProduct, (state) => {
    return {
      ...state,
    };
  }),
  on(ProductActions.updateProductSuccess, (state, { product }) => {
    return {
      ...state,
      products: state.products.map((c) => (c.id === product.id ? product : c)),
    };
  }),
  on(ProductActions.updateProductFailure, (state, { error }) => {
    return {
      ...state,
      error,
    };
  }),

  ////////// SECCION DELETE
  on(ProductActions.deleteProduct, (state, { id }) => ({
    ...state,
    products: state.products.filter((product) => product.id !== id),
  }))
);

export const productFeature = createFeature({
  name: productFeatureKey,
  reducer,
});
