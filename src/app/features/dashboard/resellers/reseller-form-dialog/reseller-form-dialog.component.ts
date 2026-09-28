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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Reseller, ResellerCreatePayload, ResellerUpdatePayload } from '../../../../core/models';

export type ResellerFormMode = 'create' | 'edit';

export interface ResellerFormDialogData {
  mode: ResellerFormMode;
  reseller?: Reseller;
}

export interface ResellerFormDialogResult {
  mode: ResellerFormMode;
  payload: ResellerCreatePayload | ResellerUpdatePayload;
  id?: string;
}

@Component({
  selector: 'app-reseller-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Nuevo reseller' : 'Editar reseller' }}
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
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="off" />
          <mat-error *ngIf="form.get('email')?.hasError('required')">Requerido</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Email inválido</mat-error>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone" autocomplete="off" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Negocio</mat-label>
            <input matInput formControlName="businessName" autocomplete="off" />
          </mat-form-field>
        </div>

        <div class="kicker ruled">Cuenta</div>

        <mat-form-field appearance="outline" class="full" *ngIf="data.mode === 'create'">
          <mat-label>Créditos iniciales</mat-label>
          <input matInput type="number" min="0" formControlName="credits" />
          <mat-hint>Opcional. Se registra como topup inicial.</mat-hint>
          <mat-error *ngIf="form.get('credits')?.hasError('min')">No puede ser negativo</mat-error>
        </mat-form-field>

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
    .content { display: flex; flex-direction: column; gap: 0.25rem; min-width: 480px; max-width: 520px; padding-top: 0.5rem; }
    @media (max-width: 520px) { .content { min-width: 0; } .row { grid-template-columns: 1fr; } }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .full { width: 100%; }
    .toggle { margin: 0.25rem 0 0.75rem; }
    .kicker {
      font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
      color: var(--ink-mute); margin: .1rem 0 .55rem;
    }
    .kicker.ruled { margin-top: .6rem; padding-top: .8rem; border-top: 1px solid var(--border-soft); }
  `],
})
export class ResellerFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ResellerFormDialogComponent, ResellerFormDialogResult>);

  form!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ResellerFormDialogData) {}

  ngOnInit(): void {
    const r = this.data.reseller;
    this.form = this.fb.group({
      firstName: [r?.firstName ?? '', Validators.required],
      lastName: [r?.lastName ?? '', Validators.required],
      email: [r?.email ?? '', [Validators.required, Validators.email]],
      phone: [r?.phone ?? ''],
      businessName: [r?.businessName ?? ''],
      credits: [0, [Validators.min(0)]],
      active: [r?.active ?? true],
      notes: [r?.notes ?? ''],
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
      const payload: ResellerCreatePayload = {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        phone: trimOpt(v.phone),
        businessName: trimOpt(v.businessName),
        credits: Number(v.credits) > 0 ? Number(v.credits) : undefined,
        notes: trimOpt(v.notes),
      };
      this.dialogRef.close({ mode: 'create', payload });
    } else {
      const payload: ResellerUpdatePayload = {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        phone: trimOpt(v.phone),
        businessName: trimOpt(v.businessName),
        active: v.active,
        notes: trimOpt(v.notes),
      };
      this.dialogRef.close({
        mode: 'edit',
        id: this.data.reseller?._id ?? this.data.reseller?.id,
        payload,
      });
    }
  }
}
