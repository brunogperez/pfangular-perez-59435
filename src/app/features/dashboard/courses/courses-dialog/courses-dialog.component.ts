import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Course } from '../models';
import { generateRandomString } from '../../../../shared/utils';

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

  get ameControl() {
    return this.courseForm.get('name');
  }
  get durationControl() {
    return this.courseForm.get('duration');
  }
  get levelControl() {
    return this.courseForm.get('level');
  }

  get descriptionControl() {
    return this.courseForm.get('description');
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
    }
  }
}
