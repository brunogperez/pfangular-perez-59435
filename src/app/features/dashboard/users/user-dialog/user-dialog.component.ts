import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { generateRandomString } from '../../../../shared/utils';
import { User } from '../models';
import { nameValidator } from '../../../../shared/utils/custom-validators';

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
      firstName: [null, [Validators.required, nameValidator]],
      lastName: [null, [nameValidator]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.minLength(8)]],
      role: [null, [Validators.required]],
    });
    this.patchForm();
  }

  get firstNameControl() {
    return this.userForm.get('firstName');
  }
  get lastNameControl() {
    return this.userForm.get('lastName');
  }
  get emailControl() {
    return this.userForm.get('email');
  }
  get passwordControl() {
    return this.userForm.get('password');
  }
  get roleControl() {
    return this.userForm.get('role');
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
        _id: this.isEditing ? this.data!.editUser!._id : generateRandomString(25),
        createdAt: this.isEditing ? this.data!.editUser!.createdAt : new Date(),
        token: this.isEditing
          ? this.data!.editUser!.token
          : generateRandomString(16),
      });
    }
  }
}
