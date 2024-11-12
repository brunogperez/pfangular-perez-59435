import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { generateRandomString } from '../../../../shared/utils';
import { Student } from '../models';
import { nameValidator } from '../../../../shared/utils/custom-validators';
import Swal from 'sweetalert2';

interface StudentDialogData {
  editStudent?: Student;
}

@Component({
  selector: 'app-students-dialog',
  templateUrl: './student-dialog.component.html',
  styleUrl: './student-dialog.component.scss',
})
export class StudentsDialogComponent {
  studentForm: FormGroup;

  constructor(
    private matDialogRef: MatDialogRef<StudentsDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data?: StudentDialogData
  ) {
    this.studentForm = this.formBuilder.group({
      firstName: [null, [nameValidator]],
      lastName: [null, [nameValidator]],
      email: [null, [Validators.required, Validators.email]],
      birthdate: [null, [Validators.required]],
    });
    this.patchForm();
  }

  get firstNameControl() {
    return this.studentForm.get('firstName');
  }
  get lastNameControl() {
    return this.studentForm.get('lastName');
  }
  get emailControl() {
    return this.studentForm.get('email');
  }

  private get isEditing() {
    return !!this.data?.editStudent;
  }

  patchForm() {
    if (this.data?.editStudent) {
      this.studentForm.patchValue(this.data.editStudent);
    }
  }

  onSave(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
    } else {
      this.matDialogRef.close({
        ...this.studentForm.value,
        id: this.isEditing
          ? this.data!.editStudent!.id
          : generateRandomString(25),
        createdAt: this.isEditing
          ? this.data!.editStudent!.createdAt
          : new Date(),
      });
      Swal.fire(
        'Buen trabajo!',
        `El alumno ha sido ${this.isEditing ? 'editado' : 'creado'} exitosamente.`,
        'success'
      );
    }
  }
}
