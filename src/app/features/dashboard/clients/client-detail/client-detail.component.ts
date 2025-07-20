import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Client } from '../models';
import { Inscription } from '../../inscriptions/models';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { InscriptionActions } from '../../inscriptions/store/inscription.actions';
import { selectorClients } from '../store/client.selectors';
import { ClientActions } from '../store/client.actions';
import { selectProduct } from '../../products/store/product.selectors';
import { ProductActions } from '../../products/store/product.actions';
import { combineLatest, map, Observable, filter } from 'rxjs';
import { selectorInscriptions } from '../../inscriptions/store/inscription.selectors';
import { Product } from '../../products/models';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
})
export class ClientDetailComponent implements OnInit {
  productId: string;
  clientId?: string;
  products$?: Observable<Product[]>;
  client$?: Observable<Client>;
  inscriptions$?: Observable<Inscription[]>;
  inscriptionsByClient$: Observable<Inscription[]>;
  productsByClient$?: Observable<Product[]>;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {
    this.productId = this.activatedRoute.snapshot.params['id'];
    this.clientId = this.activatedRoute.snapshot.params['id'];
    this.inscriptions$ = this.store.select(selectorInscriptions);
    this.inscriptionsByClient$ = this.inscriptions$.pipe(
      map((inscriptions) =>
        inscriptions.filter(
          (inscription) => inscription.clientId === this.clientId
        )
      )
    );
    this.client$ = this.store
      .select(selectorClients)
      .pipe(
        map(
          (clients) =>
            clients.find((client) => client._id === this.clientId)!
        )
      );

    this.products$ = this.store.select(selectProduct);

    this.productsByClient$ = combineLatest([
      this.products$,
      this.inscriptionsByClient$,
    ]).pipe(
      map(([products, inscriptionsByClient]) => {
        const inscriptions = inscriptionsByClient.map((i) => i.productId);

        return products.filter((product) => inscriptions.includes(product.id));
      })
    );
  }
  ngOnInit(): void {
    this.store.dispatch(ClientActions.loadClients());
    this.store.dispatch(ProductActions.loadProducts());
    this.store.dispatch(InscriptionActions.loadInscriptions());
  }

  onDeleteInscription(id: string) {
    const productRoute = this.productId;
    if (productRoute) {
      this.store.select(selectorInscriptions).subscribe((inscriptions) => {
        const filteredInscriptions = inscriptions.filter(
          (inscription) => inscription.productId === id
        );
        if (filteredInscriptions.length > 0) {
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
                  id: filteredInscriptions[0].id,
                })
              );
            }
          });
        }
      });
    }
  }
}
