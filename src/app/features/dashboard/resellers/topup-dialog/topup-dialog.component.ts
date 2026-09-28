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
import { CreditOperationPayload, Reseller } from '../../../../core/models';

export interface TopupDialogData {
  reseller: Reseller;
}

export interface TopupDialogResult {
  id: string;
  payload: CreditOperationPayload;
}

@Component({
  selector: 'app-topup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Cargar créditos</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="content">
        <div class="who">
          <span class="who-name">{{ data.reseller.firstName }} {{ data.reseller.lastName }}</span>
          <span class="who-biz" *ngIf="data.reseller.businessName">{{ data.reseller.businessName }}</span>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Cantidad a cargar</mat-label>
          <input matInput type="number" min="1" formControlName="amount" autofocus />
          <mat-error *ngIf="form.get('amount')?.hasError('required')">Requerido</mat-error>
          <mat-error *ngIf="form.get('amount')?.hasError('min')">Debe ser mayor a 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Nota (opcional)</mat-label>
          <input matInput formControlName="note" placeholder="Ej: pago efectivo, transferencia..." />
        </mat-form-field>

        <div class="readout">
          <div class="ro">
            <span class="k">Saldo actual</span>
            <span class="v mono">{{ data.reseller.credits }}cr</span>
          </div>
          <div class="ro">
            <span class="k">Carga</span>
            <span class="v mono accent">+{{ amount }}cr</span>
          </div>
          <div class="ro">
            <span class="k">Nuevo saldo</span>
            <span class="v mono good">{{ newBalance }}cr</span>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancel()">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Cargar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .content { display: flex; flex-direction: column; gap: 0.25rem; min-width: 420px; padding-top: 0.5rem; }
    @media (max-width: 460px) { .content { min-width: 0; } }
    .full { width: 100%; }
    .who { display: flex; align-items: baseline; gap: .5rem; margin-bottom: .9rem; }
    .who-name { font-size: 1.05rem; font-weight: 700; color: var(--ink); letter-spacing: -.01em; }
    .who-biz { font-size: .8rem; color: var(--ink-mute); }
    /* readout de saldo: strip ruled/mono, mismo lenguaje que subscription-detail */
    .readout { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-top: .5rem; }
    .ro { padding: .7rem .85rem; border-right: 1px solid var(--border-soft); }
    .ro:last-child { border-right: none; }
    .ro .k { display: block; font-size: .64rem; text-transform: uppercase; letter-spacing: .09em; color: var(--ink-mute); font-weight: 600; }
    .ro .v { display: block; margin-top: .3rem; font-size: 1.15rem; font-weight: 500; color: var(--ink); letter-spacing: -.01em; }
    .ro .v.accent { color: var(--accent-ink); }
    .ro .v.good { color: var(--good); }
  `],
})
export class TopupDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TopupDialogComponent, TopupDialogResult>);

  form!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: TopupDialogData) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      note: [''],
    });
  }

  get amount(): number {
    return Number(this.form?.get('amount')?.value ?? 0) || 0;
  }

  get newBalance(): number {
    return this.data.reseller.credits + this.amount;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const id = this.data.reseller._id ?? this.data.reseller.id ?? '';
    this.dialogRef.close({
      id,
      payload: {
        amount: Number(v.amount),
        note: (v.note ?? '').trim() || undefined,
      },
    });
  }
}
