import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product, ClassItem } from '../models';
import { Store } from '@ngrx/store';
import { selectorInscriptions } from '../../inscriptions/store/inscription.selectors';
import { combineLatest, filter, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { InscriptionActions } from '../../inscriptions/store/inscription.actions';
import { Inscription } from '../../inscriptions/models';
import { Client } from '../../clients/models';
import { selectorClients } from '../../clients/store/client.selectors';
import { ClientActions } from '../../clients/store/client.actions';
import Swal from 'sweetalert2';
import { ProductActions } from '../store/product.actions';
import { selectProductById } from '../store/product.selectors';


@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  productId: string;
  product$!: Observable<Product | undefined>;
  classList: ClassItem[] = [];
  inscriptions$: Observable<Inscription[]>;
  inscriptionsByProduct$: Observable<Inscription[]>;
  clientsByProduct$: Observable<Client[]>;
  clients$: Observable<Client[]>;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {
    this.productId = this.activatedRoute.snapshot.params['id'];
    this.clients$ = this.store.select(selectorClients);
    this.inscriptions$ = this.store.select(selectorInscriptions);
    
    // Initialize inscriptionsByProduct$ after productId is set
    this.inscriptionsByProduct$ = this.inscriptions$.pipe(
      map((inscriptions: Inscription[]) =>
        inscriptions.filter(
          (inscription) => inscription.productId === this.productId
        )
      )
    );

    this.clientsByProduct$ = combineLatest([
      this.clients$,
      this.inscriptionsByProduct$,
    ]).pipe(
      map(([clients, inscriptionsByProduct]) => {
        const clientIds = inscriptionsByProduct.map((i) => i.clientId);
        return clients.filter((client) => clientIds.includes(client._id));
      })
    );
  }
  ngOnInit(): void {
    // Load initial data
    this.store.dispatch(InscriptionActions.loadInscriptions());
    this.store.dispatch(ClientActions.loadClients());
    
    // Get product ID from route parameters
    this.productId = this.activatedRoute.snapshot.params['id'];
    
    // Only load product if we have a valid ID
    if (this.productId) {
      this.store.dispatch(ProductActions.loadProductById({ id: this.productId }));
      // Initialize product$ after dispatching the load action
      this.product$ = this.store.select(selectProductById(this.productId));
    } else {
      console.warn('No product ID found in route parameters');
    }
  }

  onDeleteInscription(clientId: string) {
    this.inscriptionsByProduct$.pipe(take(1)).subscribe((inscriptions: Inscription[]) => {
      const inscription = inscriptions.find(
        (i) => i.clientId === clientId && i.productId === this.productId
      );

      if (!inscription) return;

      Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás revertir esta acción',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.store.dispatch(
            InscriptionActions.deleteInscription({
              id: inscription.id,
            })
          );
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
