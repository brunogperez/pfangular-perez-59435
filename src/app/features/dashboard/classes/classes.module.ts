import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassesRoutingModule } from './classes-routing.module';
import { ClassesComponent } from './classes.component';
import { SharedModule } from '../../../shared/shared.module';


@NgModule({
  declarations: [
    ClassesComponent
  ],
  imports: [
    CommonModule,
    ClassesRoutingModule,
    SharedModule
  ]
})
export class ClassesModule { }
