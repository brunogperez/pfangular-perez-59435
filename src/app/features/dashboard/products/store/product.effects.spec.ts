import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ProductEffects } from './product.effects';
import { ProductActions } from './product.actions';
import { ProductsService } from '../../../../core/services/products.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MockProvider } from 'ng-mocks';
import { Product } from '../models';
import { Action } from '@ngrx/store';

const mockProduct: Product = {
  id: 'p1',
  name: 'Angular Avanzado',
  duration: '3 meses',
  level: 'Avanzado',
  description: 'Curso avanzado',
  classes: [{ id: 1, name: 'Clase 1', date: new Date() }],
};

const mockProducts: Product[] = [mockProduct];

describe('ProductEffects', () => {
  let effects: ProductEffects;
  let actions$: Observable<Action>;
  let productsService: ProductsService;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductEffects,
        provideMockActions(() => actions$),
        MockProvider(ProductsService, {
          getProducts: () => of(mockProducts),
          getProductById: () => of(mockProduct),
          createProduct: () => of(mockProduct),
          updateProductById: () => of(mockProducts),
          removeProductById: () => of(mockProducts),
        }),
        MockProvider(NotificationService, {
          showSuccess: () => {},
          showError: () => {},
        }),
      ],
    });

    effects = TestBed.inject(ProductEffects);
    productsService = TestBed.inject(ProductsService);
    notificationService = TestBed.inject(NotificationService);
  });

  it('loadProducts$ debe cargar productos exitosamente', (done) => {
    actions$ = of(ProductActions.loadProducts());
    (effects.loadProducts$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ProductActions.loadProductsSuccess({ data: mockProducts }));
      done();
    });
  });

  it('loadProducts$ debe manejar error', (done) => {
    const error = new Error('Network error');
    spyOn(productsService, 'getProducts').and.returnValue(throwError(() => error));
    actions$ = of(ProductActions.loadProducts());
    (effects.loadProducts$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ProductActions.loadProductsFailure({ error }));
      done();
    });
  });

  it('loadProductById$ debe cargar un producto por id', (done) => {
    actions$ = of(ProductActions.loadProductById({ id: 'p1' }));
    (effects.loadProductById$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ProductActions.loadProductByIdSuccess({ data: mockProduct }));
      done();
    });
  });

  it('createProducts$ debe crear un producto y mostrar notificación', (done) => {
    spyOn(notificationService, 'showSuccess');
    actions$ = of(ProductActions.createProduct({ product: mockProduct }));
    (effects.createProducts$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ProductActions.createProductSuccess({ product: mockProduct }));
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Producto creado exitosamente.'
      );
      done();
    });
  });

  it('createProducts$ debe manejar error y mostrar notificación', (done) => {
    const error = new Error('Create error');
    spyOn(productsService, 'createProduct').and.returnValue(throwError(() => error));
    spyOn(notificationService, 'showError');
    actions$ = of(ProductActions.createProduct({ product: mockProduct }));
    (effects.createProducts$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ProductActions.createProductFailure({ error }));
      expect(notificationService.showError).toHaveBeenCalledWith(
        'No se pudo crear el producto.'
      );
      done();
    });
  });

  it('loadProductsAfterUpdate$ debe recargar despues de update', (done) => {
    actions$ = of(ProductActions.updateProductSuccess({ product: mockProduct }));
    (effects.loadProductsAfterUpdate$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ProductActions.loadProducts());
      done();
    });
  });
});
