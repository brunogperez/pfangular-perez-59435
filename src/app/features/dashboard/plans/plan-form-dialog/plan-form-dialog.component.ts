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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Observable, map, of, startWith } from 'rxjs';
import { Plan, PlanCreatePayload, PlanUpdatePayload } from '../../../../core/models';

export type PlanFormMode = 'create' | 'edit';

export interface PlanFormDialogData {
  mode: PlanFormMode;
  plan?: Plan;
  serviceTypes: string[];
}

export interface PlanFormDialogResult {
  mode: PlanFormMode;
  payload: PlanCreatePayload | PlanUpdatePayload;
  id?: string;
}

@Component({
  selector: 'app-plan-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Nuevo plan' : 'Editar plan' }}
    </h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="content">
        <div class="kicker">Servicio</div>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nombre del plan</mat-label>
          <input matInput formControlName="name" autocomplete="off" />
          <mat-error *ngIf="form.get('name')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Tipo de servicio</mat-label>
          <input
            matInput
            formControlName="serviceType"
            [matAutocomplete]="auto"
            placeholder="Ej: IPTV, VPN, Hosting (libre)"
            autocomplete="off" />
          <mat-autocomplete #auto="matAutocomplete">
            <mat-option *ngFor="let st of (filteredServiceTypes$ | async)" [value]="st">
              {{ st }}
            </mat-option>
          </mat-autocomplete>
          <mat-hint>Texto libre. Sugiere los existentes.</mat-hint>
          <mat-error *ngIf="form.get('serviceType')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <div class="kicker ruled">Términos</div>
        <div class="row3">
          <mat-form-field appearance="outline">
            <mat-label>Duración (días)</mat-label>
            <input matInput type="number" min="1" formControlName="durationDays" />
            <mat-error *ngIf="form.get('durationDays')?.hasError('required')">Requerido</mat-error>
            <mat-error *ngIf="form.get('durationDays')?.hasError('min')">> 0</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Capacidad</mat-label>
            <input matInput type="number" min="0" formControlName="capacity" />
            <mat-hint>Opcional. Ej: 1 conexión.</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Costo en créditos</mat-label>
            <input matInput type="number" min="0" formControlName="creditCost" />
            <mat-error *ngIf="form.get('creditCost')?.hasError('required')">Requerido</mat-error>
            <mat-error *ngIf="form.get('creditCost')?.hasError('min')">>= 0</mat-error>
          </mat-form-field>
        </div>

        <div class="kicker ruled">Precios</div>
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Precio Owner (USD)</mat-label>
            <input matInput type="number" min="0" step="0.01" formControlName="ownerPrice" />
            <mat-error *ngIf="form.get('ownerPrice')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sugerido reseller (USD)</mat-label>
            <input matInput type="number" min="0" step="0.01" formControlName="suggestedResellerPrice" />
            <mat-error *ngIf="form.get('suggestedResellerPrice')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
        </div>

        <div class="kicker ruled">Credenciales</div>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Campos de credenciales</mat-label>
          <mat-chip-grid #chipGrid aria-label="credenciales">
            <mat-chip-row *ngFor="let f of credentialFields" (removed)="removeField(f)">
              {{ f }}
              <button matChipRemove type="button">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
            <input
              placeholder="Ej: username, password, m3uUrl..."
              [matChipInputFor]="chipGrid"
              [matChipInputSeparatorKeyCodes]="separators"
              (matChipInputTokenEnd)="addField($event)" />
          </mat-chip-grid>
          <mat-hint>Enter o coma para agregar. Define qué se pedirá al alta de suscripción.</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>

        <mat-slide-toggle *ngIf="data.mode === 'edit'" formControlName="active" class="toggle">
          Activo
        </mat-slide-toggle>
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
    .content { display: flex; flex-direction: column; gap: 0.25rem; min-width: 600px; max-width: 640px; padding-top: 0.5rem; }
    @media (max-width: 640px) { .content { min-width: 0; } .row, .row3 { grid-template-columns: 1fr; } }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
    .full { width: 100%; }
    .toggle { margin: 0.5rem 0 0.25rem; }
    /* kickers de sección — ordenan el form denso */
    .kicker {
      font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
      color: var(--ink-mute); margin: .1rem 0 .55rem;
    }
    .kicker.ruled { margin-top: .6rem; padding-top: .8rem; border-top: 1px solid var(--border-soft); }
  `],
})
export class PlanFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PlanFormDialogComponent, PlanFormDialogResult>);

  separators = [ENTER, COMMA] as const;
  form!: FormGroup;
  credentialFields: string[] = [];
  filteredServiceTypes$: Observable<string[]> = of([]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: PlanFormDialogData) {}

  ngOnInit(): void {
    const p = this.data.plan;
    this.credentialFields = [...(p?.credentialFields ?? [])];

    this.form = this.fb.group({
      name: [p?.name ?? '', Validators.required],
      serviceType: [p?.serviceType ?? '', Validators.required],
      durationDays: [p?.durationDays ?? 30, [Validators.required, Validators.min(1)]],
      capacity: [p?.capacity ?? null, Validators.min(0)],
      creditCost: [p?.creditCost ?? 0, [Validators.required, Validators.min(0)]],
      ownerPrice: [p?.ownerPrice ?? 0, [Validators.required, Validators.min(0)]],
      suggestedResellerPrice: [
        p?.suggestedResellerPrice ?? 0,
        [Validators.required, Validators.min(0)],
      ],
      description: [p?.description ?? ''],
      active: [p?.active ?? true],
    });

    this.filteredServiceTypes$ = this.form.get('serviceType')!.valueChanges.pipe(
      startWith(this.form.get('serviceType')!.value ?? ''),
      map((v: string) => {
        const q = (v ?? '').toString().toLowerCase().trim();
        if (!q) return this.data.serviceTypes;
        return this.data.serviceTypes.filter((st) => st.toLowerCase().includes(q));
      })
    );
  }

  addField(event: MatChipInputEvent): void {
    const value = (event.value ?? '').trim();
    if (value && !this.credentialFields.includes(value)) {
      this.credentialFields = [...this.credentialFields, value];
    }
    event.chipInput?.clear();
  }

  removeField(field: string): void {
    this.credentialFields = this.credentialFields.filter((f) => f !== field);
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
    const numOpt = (n: any): number | undefined => {
      const x = Number(n);
      return Number.isFinite(x) && n !== null && n !== '' ? x : undefined;
    };

    const base = {
      name: v.name.trim(),
      serviceType: v.serviceType.trim(),
      durationDays: Number(v.durationDays),
      capacity: numOpt(v.capacity),
      creditCost: Number(v.creditCost),
      ownerPrice: Number(v.ownerPrice),
      suggestedResellerPrice: Number(v.suggestedResellerPrice),
      credentialFields: this.credentialFields.length ? this.credentialFields : undefined,
      description: trimOpt(v.description),
    };

    if (this.data.mode === 'create') {
      this.dialogRef.close({ mode: 'create', payload: base as PlanCreatePayload });
    } else {
      const payload: PlanUpdatePayload = { ...base, active: v.active };
      this.dialogRef.close({
        mode: 'edit',
        id: this.data.plan?._id ?? this.data.plan?.id,
        payload,
      });
    }
  }
}
