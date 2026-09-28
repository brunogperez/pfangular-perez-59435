import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  EndCustomer,
  EndCustomerCreatePayload,
  EndCustomerUpdatePayload,
  Reseller,
} from '../../../../core/models';

export type EndCustomerFormMode = 'create' | 'edit';

export interface EndCustomerFormDialogData {
  mode: EndCustomerFormMode;
  customer?: EndCustomer;
  resellers: Reseller[];
}

export interface EndCustomerFormDialogResult {
  mode: EndCustomerFormMode;
  payload: EndCustomerCreatePayload | EndCustomerUpdatePayload;
  id?: string;
}

const idOf = (r: Reseller): string => r._id ?? r.id ?? '';

@Component({
  selector: 'app-end-customer-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Nuevo cliente final' : 'Editar cliente final' }}
    </h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="content">
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="firstName" autocomplete="off" />
            <mat-error *ngIf="form.get('firstName')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="lastName" autocomplete="off" />
            <mat-error *ngIf="form.get('lastName')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Reseller</mat-label>
          <mat-select formControlName="reseller">
            <mat-option *ngFor="let r of data.resellers" [value]="idOf(r)">
              <span *ngIf="r.isOwner">Owner ({{ r.firstName }} {{ r.lastName }})</span>
              <span *ngIf="!r.isOwner">
                {{ r.firstName }} {{ r.lastName }}
                <span *ngIf="r.businessName" class="biz">— {{ r.businessName }}</span>
              </span>
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('reseller')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="off" />
            <mat-error *ngIf="form.get('email')?.hasError('email')">Email inválido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone" autocomplete="off" />
          </mat-form-field>
        </div>

        <div class="kicker ruled">Cuenta</div>

        <mat-slide-toggle *ngIf="data.mode === 'edit'" formControlName="active" class="toggle">
          Activo
        </mat-slide-toggle>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Notas</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancel()">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          {{ data.mode === 'create' ? 'Crear' : 'Guardar' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .content { display: flex; flex-direction: column; gap: 0.25rem; min-width: 500px; max-width: 540px; padding-top: 0.5rem; }
    @media (max-width: 540px) { .content { min-width: 0; } .row { grid-template-columns: 1fr; } }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .full { width: 100%; }
    .toggle { margin: 0.25rem 0 0.75rem; }
    .biz { color: var(--ink-mute); font-size: 0.85rem; }
    .kicker {
      font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
      color: var(--ink-mute); margin: .1rem 0 .55rem;
    }
    .kicker.ruled { margin-top: .6rem; padding-top: .8rem; border-top: 1px solid var(--border-soft); }
  `],
})
export class EndCustomerFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(
    MatDialogRef<EndCustomerFormDialogComponent, EndCustomerFormDialogResult>
  );

  form!: FormGroup;
  idOf = idOf;

  constructor(@Inject(MAT_DIALOG_DATA) public data: EndCustomerFormDialogData) {}

  ngOnInit(): void {
    const c = this.data.customer;
    const currentResellerId =
      typeof c?.reseller === 'string' ? c.reseller : c?.reseller?._id ?? '';
    this.form = this.fb.group({
      firstName: [c?.firstName ?? '', Validators.required],
      lastName: [c?.lastName ?? '', Validators.required],
      reseller: [currentResellerId, Validators.required],
      email: [c?.email ?? '', Validators.email],
      phone: [c?.phone ?? ''],
      active: [c?.active ?? true],
      notes: [c?.notes ?? ''],
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const trimOpt = (s: string): string | undefined => {
      const t = (s ?? '').trim();
      return t.length ? t : undefined;
    };

    if (this.data.mode === 'create') {
      const payload: EndCustomerCreatePayload = {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        reseller: v.reseller,
        email: trimOpt(v.email),
        phone: trimOpt(v.phone),
        notes: trimOpt(v.notes),
      };
      this.dialogRef.close({ mode: 'create', payload });
    } else {
      const payload: EndCustomerUpdatePayload = {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        reseller: v.reseller,
        email: trimOpt(v.email),
        phone: trimOpt(v.phone),
        active: v.active,
        notes: trimOpt(v.notes),
      };
      this.dialogRef.close({
        mode: 'edit',
        id: this.data.customer?._id ?? this.data.customer?.id,
        payload,
      });
    }
  }
}
