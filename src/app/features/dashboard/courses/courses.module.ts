import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoursesRoutingModule } from './courses-routing.module';
import { CoursesComponent } from './courses.component';
import { SharedModule } from '../../../shared/shared.module';
import { CoursesDialogComponent } from './course-dialog/courses-dialog.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { EffectsModule } from '@ngrx/effects';
import { CourseEffects } from './store/course.effects';
import { courseFeature } from './store/course.reducer';
import { StoreModule } from '@ngrx/store';
import { inscriptionFeature } from '../inscriptions/store/inscription.reducer';
import { InscriptionEffects } from '../inscriptions/store/inscription.effects';
import { clientFeature } from '../clients/store/client.reducer';
import { ClientEffects } from '../clients/store/client.effects';

@NgModule({
  declarations: [
    CoursesComponent,
    CoursesDialogComponent,
    CourseDetailComponent,
  ],
  imports: [
    CommonModule,
    CoursesRoutingModule,
    SharedModule,
    StoreModule.forFeature(clientFeature),
    StoreModule.forFeature(inscriptionFeature),
    StoreModule.forFeature(courseFeature),
    EffectsModule.forFeature([CourseEffects]),
    EffectsModule.forFeature([InscriptionEffects]),
    EffectsModule.forFeature([ClientEffects]),
  ],
})
export class CoursesModule {}
