import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InscriptionsRoutingModule } from './inscriptions-routing.module';
import { InscriptionsComponent } from './inscriptions.component';
import { SharedModule } from '../../../shared/shared.module';
import { InscriptionDialogComponent } from './inscription-dialog/inscription-dialog.component';
import { EffectsModule } from '@ngrx/effects';
import { InscriptionEffects } from './store/inscription.effects';
import { StoreModule } from '@ngrx/store';
import { inscriptionFeature } from './store/inscription.reducer';
import { clientFeature } from '../clients/store/client.reducer';
import { ClientEffects } from '../clients/store/client.effects';
import { courseFeature } from '../courses/store/course.reducer';
import { CourseEffects } from '../courses/store/course.effects';

@NgModule({
  declarations: [InscriptionsComponent, InscriptionDialogComponent],
  imports: [
    CommonModule,
    InscriptionsRoutingModule,
    SharedModule,
    StoreModule.forFeature(inscriptionFeature),
    EffectsModule.forFeature([InscriptionEffects]),
    StoreModule.forFeature(clientFeature),
    EffectsModule.forFeature([ClientEffects]),
    StoreModule.forFeature(courseFeature),
    EffectsModule.forFeature([CourseEffects]),
  ],
})
export class InscriptionsModule {}
