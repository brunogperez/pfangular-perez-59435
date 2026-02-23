import { selectProduct, selectProductById, selectProductState } from './product.selectors';
import { State, initialState } from './product.reducer';
import { Product } from '../models';

const mockProduct: Product = {
  id: 'p1',
  name: 'Angular Avanzado',
  duration: '3 meses',
  level: 'Avanzado',
  description: 'Curso avanzado de Angular',
  classes: [],
};

const mockProduct2: Product = {
  id: 'p2',
  name: 'React Basico',
  duration: '2 meses',
  level: 'Basico',
  description: 'Curso basico de React',
  classes: [],
};

const mockState: State = {
  ...initialState,
  products: [mockProduct, mockProduct2],
};

describe('Product Selectors', () => {
  it('selectProductState debe retornar el estado del feature product', () => {
    const result = selectProductState.projector(mockState);
    expect(result).toEqual(mockState);
  });

  it('selectProduct debe retornar la lista de productos', () => {
    const result = selectProduct.projector(mockState);
    expect(result).toEqual([mockProduct, mockProduct2]);
  });

  it('selectProductById debe retornar el producto por id', () => {
    const selector = selectProductById('p1');
    const result = selector.projector(mockState);
    expect(result).toEqual(mockProduct);
  });

  it('selectProductById debe retornar undefined si no existe', () => {
    const selector = selectProductById('nonexistent');
    const result = selector.projector(mockState);
    expect(result).toBeUndefined();
  });
});
