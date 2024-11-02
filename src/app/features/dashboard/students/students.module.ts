import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentsRoutingModule } from './students-routing.module';
import { StudentsComponent } from './students.component';
import { SharedModule } from '../../../shared/shared.module';
import { StudentsDialogComponent } from './student-dialog/student-dialog.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';

@NgModule({
  declarations: [
    StudentsComponent,
    StudentsDialogComponent,
    StudentDetailComponent,
  ],
  imports: [CommonModule, StudentsRoutingModule, SharedModule],
})
export class StudentsModule {}
