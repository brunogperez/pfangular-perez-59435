import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Course } from '../models';
import { generateRandomString } from '../../../../shared/utils';
import Swal from 'sweetalert2';

interface CourseModalData {
  editCourse?: Course;
}
@Component({
  selector: 'app-courses-dialog',
  templateUrl: './courses-dialog.component.html',
  styleUrl: './courses-dialog.component.scss',
})
export class CoursesDialogComponent {
  courseForm: FormGroup;

  durations: Array<'2 months' | '3 months' | '4 months' | '5 months'> = [
    '2 months',
    '3 months',
    '4 months',
    '5 months',
  ];

  levels: Array<'Intermediate' | 'Advanced' | 'Beginner'> = [
    'Beginner',
    'Intermediate',
    'Advanced',
  ];
  constructor(
    private matDialogRef: MatDialogRef<CoursesDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data?: CourseModalData
  ) {
    this.courseForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      duration: [null, [Validators.required]],
      level: [null, [Validators.required]],
      description: [null, [Validators.required]],
    });
    this.patchForm();
  }

  patchForm() {
    if (this.data?.editCourse) {
      this.courseForm.patchValue(this.data.editCourse);
    }
  }

  private get isEditing() {
    return !!this.data?.editCourse;
  }

  onSave(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
    } else {
      this.matDialogRef.close({
        ...this.courseForm.value,
        id: this.isEditing
          ? this.data!.editCourse!.id
          : generateRandomString(8),
      });
      Swal.fire(
        'Buen trabajo!',
        `El curso ha sido ${
          this.isEditing ? 'editado' : 'creado'
        } exitosamente.`,
        'success'
      );
    }
  }
}
