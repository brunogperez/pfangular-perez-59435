import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  catchError,
  concatMap,
  distinctUntilChanged,
  map,
  mergeMap,
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductActions } from './product.actions';
import { Action } from '@ngrx/store';
import { ProductsService } from '../../../../core/services/products.service'
import { NotificationService } from '../../../../core/services/notification.service';

@Injectable()
export class ProductEffects {
  loadProducts$: Actions<Action<string>>;
  loadProductById$: Actions<Action<string>>;
  loadProductsAfterUpdate$: Actions<Action<string>>;
  deleteProducts$: Actions<Action<string>>;
  updateProducts$: Actions<Action<string>>;
  createProducts$: Actions<Action<string>>;

  constructor(
    private actions$: Actions,
    private productsService: ProductsService,
    private notificationService: NotificationService,
  ) {
    this.loadProducts$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ProductActions.loadProducts),
        concatMap(() =>
          this.productsService.getProducts().pipe(
            map((res) => ProductActions.loadProductsSuccess({ data: res })),
            catchError((error) =>
              of(ProductActions.loadProductsFailure({ error }))
            )
          )
        )
      );
    });

    this.loadProductById$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ProductActions.loadProductById),
        mergeMap(({ id }) =>
          this.productsService.getProductById(id).pipe(
            map((product) =>
              ProductActions.loadProductByIdSuccess({ data: product })
            ),
            catchError((error) =>
              of(ProductActions.loadProductByIdFailure({ error }))
            )
          )
        )
      )
    );

    this.loadProductsAfterUpdate$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(
          ProductActions.createProductSuccess,
          ProductActions.updateProductSuccess,
          ProductActions.deleteProductSuccess
        ),
        map(() => ProductActions.loadProducts())
      );
    });

    this.createProducts$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ProductActions.createProduct),
        mergeMap(({ product }) =>
          this.productsService.createProduct(product).pipe(
            map((newProduct) => {
              this.notificationService.showSuccess('Producto creado exitosamente.');
              return ProductActions.createProductSuccess({ product: newProduct });
            }),
            catchError((error) => {
              this.notificationService.showError('No se pudo crear el producto.');
              return of(ProductActions.createProductFailure({ error }));
            })
          )
        )
      );
    });

    this.updateProducts$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ProductActions.updateProduct),
        distinctUntilChanged(),
        mergeMap(({ id, update }) =>
          this.productsService.updateProductById(id, update).pipe(
            map((product) => {
              const updatedProduct = product[0];
              this.notificationService.showSuccess('Producto actualizado exitosamente.');
              return ProductActions.updateProductSuccess({
                product: updatedProduct,
              });
            }),
            catchError((error) => {
              this.notificationService.showError('No se pudo actualizar el producto.');
              return of(ProductActions.updateProductFailure({ error }));
            })
          )
        )
      );
    });

    this.deleteProducts$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ProductActions.deleteProduct),
        switchMap(({ id }) =>
          this.productsService.removeProductById(id).pipe(
            map((res) => {
              this.notificationService.showSuccess('El producto ha sido eliminado.', '¡Eliminado!');
              return ProductActions.deleteProductSuccess({ data: res });
            }),
            catchError((error) => {
              this.notificationService.showError('Hubo un problema al eliminar el producto.');
              return of(ProductActions.deleteProductFailure({ error }));
            })
          )
        )
      );
    });
  }
}
