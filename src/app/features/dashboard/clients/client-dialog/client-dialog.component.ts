import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { generateRandomString } from '../../../../shared/utils';
import { Client } from '../models';
import { nameValidator } from '../../../../shared/utils/custom-validators';
import Swal from 'sweetalert2';

interface ClientDialogData {
  editClient?: Client;
}

@Component({
  selector: 'app-clients-dialog',
  templateUrl: './client-dialog.component.html',
  styleUrl: './client-dialog.component.scss',
})
export class ClientsDialogComponent {
  clientForm: FormGroup;

  constructor(
    private matDialogRef: MatDialogRef<ClientsDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data?: ClientDialogData
  ) {
    this.clientForm = this.formBuilder.group({
      firstName: [null, [nameValidator]],
      lastName: [null, [nameValidator]],
      email: [null, [Validators.required, Validators.email]],
      birthdate: [null, [Validators.required]],
    });
    this.patchForm();
  }

  get firstNameControl() {
    return this.clientForm.get('firstName');
  }
  get lastNameControl() {
    return this.clientForm.get('lastName');
  }
  get emailControl() {
    return this.clientForm.get('email');
  }

  private get isEditing() {
    return !!this.data?.editClient;
  }

  patchForm() {
    if (this.data?.editClient) {
      this.clientForm.patchValue(this.data.editClient);
    }
  }

  onSave(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
    } else {
      this.matDialogRef.close({
        ...this.clientForm.value,
        id: this.isEditing
          ? this.data!.editClient!.id
          : generateRandomString(25),
        createdAt: this.isEditing
          ? this.data!.editClient!.createdAt
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
