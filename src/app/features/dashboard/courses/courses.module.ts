import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoursesRoutingModule } from './courses-routing.module';
import { CoursesComponent } from './courses.component';
import { SharedModule } from '../../../shared/shared.module';
import { CoursesDialogComponent } from './course-dialog/courses-dialog.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';

@NgModule({
  declarations: [CoursesComponent, CoursesDialogComponent, CourseDetailComponent],
  imports: [CommonModule, CoursesRoutingModule, SharedModule],
})
export class CoursesModule {}
