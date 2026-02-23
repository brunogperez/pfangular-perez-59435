import { Component, Inject } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Inscription } from '../models';
import { Observable } from 'rxjs';
import { Product } from '../../products/models';
import { InscriptionService } from '../../../../core/services/inscriptions.service';
import { Store } from '@ngrx/store';
import { InscriptionActions } from '../store/inscription.actions';
import { selectProduct } from '../../products/store/product.selectors';
import { NotificationService } from '../../../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

interface InscriptionDialogData {
  inscription?: Inscription;
}

@Component({
  selector: 'app-inscription-dialog',
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
  templateUrl: './inscription-dialog.component.html',
  styleUrl: './inscription-dialog.component.scss',
})
export class InscriptionDialogComponent {
  inscriptionForm: FormGroup<{
    clientId: FormControl<string | null>;
    productId: FormControl<string | null>;
  }>;
  products$: Observable<Product[]>;

  constructor(
    private matDialogRef: MatDialogRef<InscriptionDialogData>,
    private formBuilder: FormBuilder,
    private inscriptionService: InscriptionService,
    private store: Store,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data?: InscriptionDialogData
  ) {
    this.products$ = this.store.select(selectProduct);
    this.inscriptionForm = this.formBuilder.group({
      clientId: [{ value: '' as string | null, disabled: true }],
      productId: [null as string | null, Validators.required],
    });
    this.inscriptionForm.patchValue({
      clientId: data?.inscription?.id,
    });
  }

  get clientIdControl() {
    return this.inscriptionForm.get('clientId');
  }
  get productIdControl() {
    return this.inscriptionForm.get('productId');
  }

  onSave(): void {
    if (this.inscriptionForm.invalid) {
      this.inscriptionForm.markAllAsTouched();
    } else {
      const formValues = this.inscriptionForm.getRawValue();
      const clientId = formValues.clientId;
      const productId = formValues.productId;

      this.inscriptionService
        .isClientEnrolled(clientId!, productId!)
        .subscribe((isEnrolled) => {
          if (isEnrolled) {
            this.notificationService.showError(
              'El cliente ya tiene asignado este producto.',
              'Atención'
            );
          } else {
            this.store.dispatch(
              InscriptionActions.createInscription({
                clientId: clientId!,
                productId: productId!,
              })
            );
            this.matDialogRef.close();
          }
        });
    }
  }
}
