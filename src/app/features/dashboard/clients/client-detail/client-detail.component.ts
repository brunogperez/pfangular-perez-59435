import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Client } from '../models';
import { Inscription } from '../../inscriptions/models';
import { Store } from '@ngrx/store';
import { InscriptionActions } from '../../inscriptions/store/inscription.actions';
import { selectorClients } from '../store/client.selectors';
import { ClientActions } from '../store/client.actions';
import { selectProduct } from '../../products/store/product.selectors';
import { ProductActions } from '../../products/store/product.actions';
import { combineLatest, map, Observable, filter } from 'rxjs';
import { selectorInscriptions } from '../../inscriptions/store/inscription.selectors';
import { Product } from '../../products/models';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { UserFullNamePipe } from '../../../../shared/pipes/user-full-name.pipe';
import { AgePipe } from '../../../../shared/pipes/age.pipe';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    UserFullNamePipe,
    AgePipe,
  ],
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

  constructor(private activatedRoute: ActivatedRoute, private store: Store, private notificationService: NotificationService) {
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

  async onDeleteInscription(id: string) {
    const productRoute = this.productId;
    if (productRoute) {
      this.store.select(selectorInscriptions).subscribe(async (inscriptions) => {
        const filteredInscriptions = inscriptions.filter(
          (inscription) => inscription.productId === id
        );
        if (filteredInscriptions.length > 0) {
          if (await this.notificationService.confirmDelete('esta inscripción')) {
            this.store.dispatch(
              InscriptionActions.deleteInscription({
                id: filteredInscriptions[0].id,
              })
            );
          }
        }
      });
    }
  }
}
