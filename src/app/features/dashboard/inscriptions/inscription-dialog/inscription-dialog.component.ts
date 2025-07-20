import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inscription } from '../models';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { Product } from '../../products/models';
import { InscriptionService } from '../../../../core/services/inscriptions.service';
import { Store } from '@ngrx/store';
import { InscriptionActions } from '../store/inscription.actions';
import { selectProduct } from '../../products/store/product.selectors';

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
  products$: Observable<Product[]>;

  constructor(
    private matDialogRef: MatDialogRef<InscriptionDialogData>,
    private formBuilder: FormBuilder,
    private inscriptionService: InscriptionService,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data?: InscriptionDialogData
  ) {
    this.products$ = this.store.select(selectProduct);
    this.inscriptionForm = this.formBuilder.group({
      clientId: [{ value: '', disabled: true }],
      productId: [null, Validators.required],
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
        .isClientEnrolled(clientId, productId)
        .subscribe((isEnrolled) => {
          if (isEnrolled) {
            Swal.fire(
              'Atención',
              'El cliente ya tiene asignado este producto.',
              'info'
            );
          } else {
            this.store.dispatch(
              InscriptionActions.createInscription({
                clientId,
                productId,
              })
            );
            this.matDialogRef.close();
          }
        });
    }
  }
}
