import { Component, OnInit } from '@angular/core';
import { Product } from './models';
import { MatDialog } from '@angular/material/dialog';
import { ProductsDialogComponent } from './product-dialog/products-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProduct } from './store/product.selectors';
import { ProductActions } from './store/product.actions';
import { InscriptionActions } from '../inscriptions/store/inscription.actions';
import { Inscription } from '../inscriptions/models';
import { selectorInscriptions } from '../inscriptions/store/inscription.selectors';
import { User } from '../users/models';
import { selectAuthUser } from '../../../store/selectors/auth.selectors';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'duration', 'level', 'actions'];

  isLoading = false;
  user$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  inscriptions$: Observable<Inscription[]>;
  products$: Observable<Product[]>;

  constructor(
    private store: Store,
    private matDialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.user$ = this.store.select(selectAuthUser);
    this.isAdmin$ = this.user$.pipe(map((user) => user?.role === 'admin'));
    this.inscriptions$ = this.store.select(selectorInscriptions);
    this.products$ = this.store.select(selectProduct);
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
    this.store.dispatch(InscriptionActions.loadInscriptions());
  }

  goToDetail(id: string): void {
    this.router.navigate([id, 'detail'], { relativeTo: this.activatedRoute });
  }

  openModal(editProduct?: Product): void {
    this.matDialog
      .open(ProductsDialogComponent, { data: { editProduct } })
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (!!res) {
            if (editProduct) {
              this.store.dispatch(
                ProductActions.updateProduct({ id: editProduct.id, update: res })
              );
            } else {
              this.store.dispatch(ProductActions.createProduct({ product: res }));
            }
          }
        },
      });
  }

  async onDeleteProduct(id: string): Promise<void> {
    if (await this.notificationService.confirmDelete('este producto')) {
      this.store.dispatch(ProductActions.deleteProduct({ id }));
    }
  }
}
