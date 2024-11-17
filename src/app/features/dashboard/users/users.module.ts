import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';

/* IMPORTS PROPIOS DEL PROYECTO */
import { SharedModule } from '../../../shared/shared.module';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { ControlErrorsComponent } from './control-errors/control-errors.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { EffectsModule } from '@ngrx/effects';
import { UserEffects } from './store/user.effects';
import { StoreModule } from '@ngrx/store';
import { userFeature } from './store/user.reducer';

@NgModule({
  declarations: [
    UsersComponent,
    UserDialogComponent,
    ControlErrorsComponent,
    UserDetailComponent,
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    EffectsModule.forFeature([UserEffects]),
    StoreModule.forFeature(userFeature),
  ],
  exports: [UsersComponent],
})
export class UsersModule {}
