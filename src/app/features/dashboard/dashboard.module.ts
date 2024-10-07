import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

/* IMPORTS PROPIOS DEL PROYECTO */
import { MatSidenavModule } from '@angular/material/sidenav';
//import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
//import { MatIconModule } from '@angular/material/icon';
import { UsersModule } from './users/users.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    SharedModule,
    UsersModule
  ],
  exports: [DashboardComponent],
})
export class DashboardModule {}
