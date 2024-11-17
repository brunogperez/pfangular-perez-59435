import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { UserFullNamePipe } from './pipes/user-full-name.pipe';
import { AgePipe } from './pipes/age.pipe';
import { FontSizeDirective } from './directives/font-size.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [UserFullNamePipe, AgePipe, FontSizeDirective],
  imports: [CommonModule],
  exports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule,
    MatTableModule,
    UserFullNamePipe,
    AgePipe,
    FontSizeDirective,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatBadgeModule,
    MatListModule,
    MatGridListModule,
    MatTabsModule,
  ],
})
export class SharedModule {}
