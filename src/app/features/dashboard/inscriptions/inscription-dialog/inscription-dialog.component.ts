import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { generateRandomString } from '../../../../shared/utils';
import { Inscription } from '../models';

import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { Course } from '../../courses/models';
import { CoursesService } from '../../../../core/services/courses.service';
import { InscriptionService } from '../../../../core/services/inscriptions.service';

interface InscriptionDialogData {
  inscription?: Inscription;
}

@Component({
  selector: 'app-inscription-dialog',
  templateUrl: './inscription-dialog.component.html',
  styleUrl: './inscription-dialog.component.scss',
})
export class InscriptionDialogComponent {
  inscriptionForm: FormGroup;
  courses$: Observable<Course[]>;

  constructor(
    private matDialogRef: MatDialogRef<InscriptionDialogData>,
    private formBuilder: FormBuilder,
    private coursesService: CoursesService,
    private inscriptionService: InscriptionService,
    @Inject(MAT_DIALOG_DATA) public data?: InscriptionDialogData
  ) {
    this.courses$ = this.coursesService.getCourses();
    this.inscriptionForm = this.formBuilder.group({
      studentId: [{ value: '12345', disabled: true }],
      courseId: [null, Validators.required],
    });
    this.inscriptionForm.patchValue({
      studentId: data?.inscription?.id,
    });
  }

  get studentIdControl() {
    return this.inscriptionForm.get('studentId');
  }
  get courseIdControl() {
    return this.inscriptionForm.get('courseId');
  }

  onSave(): void {
    if (this.inscriptionForm.invalid) {
      this.inscriptionForm.markAllAsTouched();
    } else {
      const formValues = this.inscriptionForm.getRawValue();
      const studentId = formValues.studentId;
      const courseId = formValues.courseId;

      this.inscriptionService
        .isStudentEnrolled(studentId, courseId)
        .subscribe((isEnrolled) => {
          if (isEnrolled) {
            Swal.fire(
              'Atención',
              'El alumno ya está inscripto en este curso.',
              'info'
            );
          } else {
            this.inscriptionService.createInscription(formValues).subscribe({
              next: () => {
                this.inscriptionService.getInscriptions();
                Swal.fire(
                  'Buen trabajo!',
                  'El alumno ha sido inscripto exitosamente.',
                  'success'
                ).then(() => {
                  this.matDialogRef.close();
                });
              },
            });
          }
        });
    }
  }
}
