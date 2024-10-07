import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';

/* IMPORTS PROPIOS DEL PROYECTO */
//import { MatCardModule } from '@angular/material/card';
//import { MatButtonModule } from '@angular/material/button';
//import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../shared/shared.module';
import { UserDialogComponent } from './user-dialog/user-dialog.component';

@NgModule({
  declarations: [UsersComponent, UserDialogComponent],
  imports: [CommonModule, UsersRoutingModule, SharedModule],
  exports: [UsersComponent],
})
export class UsersModule {}
