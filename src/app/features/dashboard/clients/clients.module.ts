import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { SharedModule } from '../../../shared/shared.module';
import { ClientsDialogComponent } from './client-dialog/client-dialog.component';
import { ClientDetailComponent } from './client-detail/client-detail.component';
import { EffectsModule } from '@ngrx/effects';
import { ClientEffects } from './store/client.effects';
import { StoreModule } from '@ngrx/store';
import { clientFeature } from './store/client.reducer';
import { inscriptionFeature } from '../inscriptions/store/inscription.reducer';
import { InscriptionEffects } from '../inscriptions/store/inscription.effects';
import { productFeature } from '../products/store/product.reducer';
import { ProductEffects } from '../products/store/product.effects';

@NgModule({
  declarations: [
    ClientsComponent,
    ClientsDialogComponent,
    ClientDetailComponent,
  ],
  imports: [
    
    CommonModule,
    ClientsRoutingModule,
    SharedModule,
    StoreModule.forFeature(clientFeature),
    EffectsModule.forFeature([ClientEffects]),
    StoreModule.forFeature(inscriptionFeature),
    EffectsModule.forFeature([InscriptionEffects]),
    StoreModule.forFeature(productFeature),
    EffectsModule.forFeature([ProductEffects]),
  ],
})
export class ClientsModule {}
