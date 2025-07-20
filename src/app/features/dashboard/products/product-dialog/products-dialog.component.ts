import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product } from '../models';
import { generateRandomString } from '../../../../shared/utils';
import Swal from 'sweetalert2';

interface ProductModalData {
  editProduct?: Product;
}
@Component({
  selector: 'app-products-dialog',
  templateUrl: './products-dialog.component.html',
  styleUrl: './products-dialog.component.scss',
})
export class ProductsDialogComponent {
  productForm: FormGroup;

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
    private matDialogRef: MatDialogRef<ProductsDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data?: ProductModalData
  ) {
    this.productForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      duration: [null, [Validators.required]],
      level: [null, [Validators.required]],
      description: [null, [Validators.required]],
    });
    this.patchForm();
  }

  patchForm() {
    if (this.data?.editProduct) {
      this.productForm.patchValue(this.data.editProduct);
    }
  }

  private get isEditing() {
    return !!this.data?.editProduct;
  }

  onSave(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
    } else {
      this.matDialogRef.close({
        ...this.productForm.value,
        id: this.isEditing
          ? this.data!.editProduct!.id
          : generateRandomString(8),
      });
    }
  }
}
