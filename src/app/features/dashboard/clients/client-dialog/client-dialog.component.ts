import { Component, Inject } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { generateRandomString } from '../../../../shared/utils';
import { Client } from '../models';
import { nameValidator } from '../../../../shared/utils/custom-validators';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ClientDialogData {
  editClient?: Client;
}

@Component({
  selector: 'app-clients-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './client-dialog.component.html',
  styleUrl: './client-dialog.component.scss',
})
export class ClientsDialogComponent {
  clientForm: FormGroup<{
    firstName: FormControl<string | null>;
    lastName: FormControl<string | null>;
    email: FormControl<string | null>;
    birthdate: FormControl<Date | null>;
  }>;

  constructor(
    private matDialogRef: MatDialogRef<ClientsDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data?: ClientDialogData
  ) {
    this.clientForm = this.formBuilder.group({
      firstName: [null as string | null, [nameValidator]],
      lastName: [null as string | null, [nameValidator]],
      email: [null as string | null, [Validators.required, Validators.email]],
      birthdate: [null as Date | null, [Validators.required]],
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
        _id: this.isEditing
          ? this.data!.editClient!._id
          : generateRandomString(25),
        createdAt: this.isEditing
          ? this.data!.editClient!.createdAt
          : new Date(),
      });
    }
  }
}
