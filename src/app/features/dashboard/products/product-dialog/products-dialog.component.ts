import { Component, Inject } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Product } from '../models';
import { generateRandomString } from '../../../../shared/utils';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

interface ProductModalData {
  editProduct?: Product;
}
@Component({
  selector: 'app-products-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './products-dialog.component.html',
  styleUrl: './products-dialog.component.scss',
})
export class ProductsDialogComponent {
  productForm: FormGroup<{
    name: FormControl<string | null>;
    duration: FormControl<string | null>;
    level: FormControl<string | null>;
    description: FormControl<string | null>;
  }>;

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
      name: [null as string | null, [Validators.required]],
      duration: [null as string | null, [Validators.required]],
      level: [null as string | null, [Validators.required]],
      description: [null as string | null, [Validators.required]],
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
