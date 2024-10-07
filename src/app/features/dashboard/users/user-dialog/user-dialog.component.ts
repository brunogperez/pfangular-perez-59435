import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { generateRandomString } from '../../../../shared/utils';
import { User } from '../models';

interface UserDialogData {
  editUser?: User;
}
@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss',
})
export class UserDialogComponent {
  userForm: FormGroup;

  constructor(
    private matDialogRef: MatDialogRef<UserDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data?: UserDialogData
  ) {
    this.userForm = this.formBuilder.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      email: [null, [Validators.required]],
      birthdate: [null, [Validators.required]],
    });
    this.patchForm();
  }

  private get isEditing() {
    return !!this.data?.editUser;
  }

  patchForm() {
    if (this.data?.editUser) {
      this.userForm.patchValue(this.data.editUser);
    }
  }

  onSave(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
    } else {
      this.matDialogRef.close({
        ...this.userForm.value,
        id: this.isEditing ? this.data!.editUser!.id : generateRandomString(4),
        createdAt: this.isEditing ? this.data!.editUser!.createdAt : new Date(),
      });
    }
  }
}
