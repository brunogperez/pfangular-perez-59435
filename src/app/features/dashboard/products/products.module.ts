import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { SharedModule } from '../../../shared/shared.module';
import { ProductsDialogComponent } from './product-dialog/products-dialog.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { EffectsModule } from '@ngrx/effects';
import { ProductEffects } from './store/product.effects';
import { productFeature } from './store/product.reducer';
import { StoreModule } from '@ngrx/store';
import { inscriptionFeature } from '../inscriptions/store/inscription.reducer';
import { InscriptionEffects } from '../inscriptions/store/inscription.effects';
import { clientFeature } from '../clients/store/client.reducer';
import { ClientEffects } from '../clients/store/client.effects';

@NgModule({
  declarations: [
    ProductsComponent,
    ProductsDialogComponent,
    ProductDetailComponent,
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    SharedModule,
    StoreModule.forFeature(clientFeature),
    StoreModule.forFeature(inscriptionFeature),
    StoreModule.forFeature(productFeature),
    EffectsModule.forFeature([ProductEffects]),
    EffectsModule.forFeature([InscriptionEffects]),
    EffectsModule.forFeature([ClientEffects]),
  ],
})
export class ProductsModule {}
