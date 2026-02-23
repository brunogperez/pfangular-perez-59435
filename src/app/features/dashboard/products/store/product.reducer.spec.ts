import { reducer, initialState, State } from './product.reducer';
import { ProductActions } from './product.actions';
import { Product } from '../models';

const mockProduct: Product = {
  id: 'p1',
  name: 'Angular Avanzado',
  duration: '3 meses',
  level: 'Avanzado',
  description: 'Curso avanzado de Angular',
  classes: [{ id: 1, name: 'Clase 1', date: new Date() }],
};

const mockProduct2: Product = {
  id: 'p2',
  name: 'React Basico',
  duration: '2 meses',
  level: 'Basico',
  description: 'Curso basico de React',
  classes: [],
};

describe('Product Reducer', () => {
  it('debe retornar el estado inicial', () => {
    const action = { type: 'Unknown' } as any;
    const state = reducer(undefined, action);
    expect(state).toEqual(initialState);
  });

  // Load Products
  it('loadProducts debe retornar el estado actual', () => {
    const action = ProductActions.loadProducts();
    const state = reducer(initialState, action);
    expect(state).toEqual(initialState);
  });

  it('loadProductsSuccess debe cargar los productos', () => {
    const products = [mockProduct, mockProduct2];
    const action = ProductActions.loadProductsSuccess({ data: products });
    const state = reducer(initialState, action);
    expect(state.products).toEqual(products);
  });

  it('loadProductsFailure debe establecer el error', () => {
    const error = new Error('Error de red');
    const action = ProductActions.loadProductsFailure({ error });
    const state = reducer(initialState, action);
    expect(state.loadProductError).toEqual(error);
  });

  // Load Product By Id
  it('loadProductByIdSuccess debe cargar el producto', () => {
    const action = ProductActions.loadProductByIdSuccess({ data: mockProduct });
    const state = reducer(initialState, action);
    expect(state.product).toEqual(mockProduct);
  });

  // Create Product
  it('createProductSuccess debe agregar el producto a la lista', () => {
    const prevState: State = { ...initialState, products: [mockProduct] };
    const action = ProductActions.createProductSuccess({ product: mockProduct2 });
    const state = reducer(prevState, action);
    expect(state.products.length).toBe(2);
    expect(state.products[1]).toEqual(mockProduct2);
  });

  // Update Product
  it('updateProductSuccess debe actualizar el producto en la lista', () => {
    const updatedProduct = { ...mockProduct, name: 'Angular Master' };
    const prevState: State = { ...initialState, products: [mockProduct, mockProduct2] };
    const action = ProductActions.updateProductSuccess({ product: updatedProduct });
    const state = reducer(prevState, action);
    expect(state.products[0].name).toBe('Angular Master');
    expect(state.products[1]).toEqual(mockProduct2);
  });

  // Delete Product
  it('deleteProduct debe remover el producto de la lista', () => {
    const prevState: State = { ...initialState, products: [mockProduct, mockProduct2] };
    const action = ProductActions.deleteProduct({ id: 'p1' });
    const state = reducer(prevState, action);
    expect(state.products.length).toBe(1);
    expect(state.products[0].id).toBe('p2');
  });
});
