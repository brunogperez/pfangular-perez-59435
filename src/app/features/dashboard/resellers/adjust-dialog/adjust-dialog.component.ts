import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CreditOperationPayload, Reseller } from '../../../../core/models';

export interface AdjustDialogData {
  reseller: Reseller;
}

export interface AdjustDialogResult {
  id: string;
  payload: CreditOperationPayload;
}

const nonZero = (control: AbstractControl): ValidationErrors | null => {
  const v = Number(control.value);
  return v === 0 ? { nonZero: true } : null;
};

@Component({
  selector: 'app-adjust-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Ajustar saldo</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="content">
        <div class="who">
          <span class="who-name">{{ data.reseller.firstName }} {{ data.reseller.lastName }}</span>
          <span class="who-biz" *ngIf="data.reseller.businessName">{{ data.reseller.businessName }}</span>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Monto del ajuste (positivo o negativo)</mat-label>
          <input matInput type="number" formControlName="amount" autofocus />
          <mat-hint>Ej: -10 resta, 25 suma. No puede ser 0.</mat-hint>
          <mat-error *ngIf="form.get('amount')?.hasError('required')">Requerido</mat-error>
          <mat-error *ngIf="form.get('amount')?.hasError('nonZero')">No puede ser 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Motivo del ajuste</mat-label>
          <input matInput formControlName="note" placeholder="Ej: corrección manual..." />
          <mat-error *ngIf="form.get('note')?.hasError('required')">Requerido — auditable</mat-error>
        </mat-form-field>

        <div class="readout">
          <div class="ro">
            <span class="k">Saldo actual</span>
            <span class="v mono">{{ data.reseller.credits }}cr</span>
          </div>
          <div class="ro">
            <span class="k">Ajuste</span>
            <span class="v mono" [class.accent]="amount > 0" [class.crit]="amount < 0">
              {{ amount > 0 ? '+' : '' }}{{ amount }}cr
            </span>
          </div>
          <div class="ro">
            <span class="k">Nuevo saldo</span>
            <span class="v mono" [class.good]="newBalance >= 0" [class.crit]="newBalance < 0">{{ newBalance }}cr</span>
          </div>
        </div>
        <p class="neg-note" *ngIf="newBalance < 0">
          <mat-icon>warning</mat-icon>
          <span>El saldo quedará en negativo.</span>
        </p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancel()">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Ajustar</button>
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
    .readout { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-top: .5rem; }
    .ro { padding: .7rem .85rem; border-right: 1px solid var(--border-soft); }
    .ro:last-child { border-right: none; }
    .ro .k { display: block; font-size: .64rem; text-transform: uppercase; letter-spacing: .09em; color: var(--ink-mute); font-weight: 600; }
    .ro .v { display: block; margin-top: .3rem; font-size: 1.15rem; font-weight: 500; color: var(--ink); letter-spacing: -.01em; }
    .ro .v.accent { color: var(--accent-ink); }
    .ro .v.good { color: var(--good); }
    .ro .v.crit { color: var(--crit); }
    .neg-note { display: flex; align-items: center; gap: .45rem; margin: .55rem 0 0; font-size: .82rem; color: var(--crit); }
    .neg-note mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `],
})
export class AdjustDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AdjustDialogComponent, AdjustDialogResult>);

  form!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AdjustDialogData) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      amount: [null, [Validators.required, nonZero]],
      note: ['', Validators.required],
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const id = this.data.reseller._id ?? this.data.reseller.id ?? '';
    this.dialogRef.close({
      id,
      payload: {
        amount: Number(v.amount),
        note: v.note.trim(),
      },
    });
  }
}
