import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  Plan,
  Reseller,
  Subscription,
  SubscriptionRenewPayload,
} from '../../../../core/models';
import { PlansService } from '../../../../core/services/plans.service';

const idOf = (x: { _id?: string; id?: string }): string => x._id ?? x.id ?? '';

export interface RenewDialogData {
  subscription: Subscription;
}

@Component({
  selector: 'app-renew-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>Renovar suscripción</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="content">
        <div class="who">
          <span class="svc" *ngIf="data.subscription.planSnapshot.serviceType">{{ data.subscription.planSnapshot.serviceType }}</span>
          <span class="who-name">{{ data.subscription.planSnapshot.name }}</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="k">Vence actual</span>
            <span class="v mono">{{ data.subscription.endDate | date:'dd/MM/yyyy':'UTC' }}</span>
          </div>
          <div class="ro">
            <span class="k">Vendedor</span>
            <span class="v">{{ sellerLabel }}</span>
          </div>
        </div>

        <mat-slide-toggle formControlName="changePlan" class="toggle">
          Cambiar plan en esta renovación
        </mat-slide-toggle>

        <mat-form-field
          *ngIf="form.get('changePlan')?.value"
          appearance="outline"
          class="full">
          <mat-label>Nuevo plan</mat-label>
          <mat-select formControlName="planId">
            <mat-option *ngFor="let p of plans" [value]="idOf(p)">
              {{ p.name }} <span class="muted">— {{ p.serviceType }} · {{ p.creditCost }}cr</span>
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Precio de venta (USD)</mat-label>
          <input matInput type="number" min="0" step="0.01" formControlName="salePrice" />
          <mat-hint>Por defecto: precio anterior {{ data.subscription.salePrice }}.</mat-hint>
        </mat-form-field>

        <p class="warn" *ngIf="!isOwner">
          <mat-icon>warning</mat-icon>
          <span>Renovar descontará créditos al reseller.</span>
        </p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancel()">Cancelar</button>
        <button mat-flat-button color="primary" type="submit">Renovar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .content { display: flex; flex-direction: column; gap: 0.5rem; min-width: 480px; padding-top: 0.5rem; }
    @media (max-width: 520px) { .content { min-width: 0; } }
    .full { width: 100%; }
    .toggle { margin: 0.25rem 0; }
    .muted { color: var(--ink-mute); font-size: 0.85rem; }
    .warn { display: flex; align-items: center; gap: 0.5rem; margin: 0; color: var(--warn); font-size: 0.9rem; }
    .warn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* header servicio + plan */
    .who { display: flex; align-items: center; gap: .55rem; margin-bottom: .3rem; }
    .who .svc {
      font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .08em;
      background: var(--accent); color: var(--on-accent); padding: .15rem .5rem; border-radius: 5px;
    }
    .who-name { font-size: 1.1rem; font-weight: 700; color: var(--ink); letter-spacing: -.01em; }
    /* readout de la suscripción actual */
    .readout { display: grid; grid-template-columns: repeat(2, 1fr); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: .4rem; }
    .ro { padding: .7rem .85rem; border-right: 1px solid var(--border-soft); }
    .ro:last-child { border-right: none; }
    .ro .k { display: block; font-size: .64rem; text-transform: uppercase; letter-spacing: .09em; color: var(--ink-mute); font-weight: 600; }
    .ro .v { display: block; margin-top: .3rem; font-size: 1rem; font-weight: 500; color: var(--ink); }
  `],
})
export class RenewDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RenewDialogComponent, SubscriptionRenewPayload>);
  private plansService = inject(PlansService);

  form!: FormGroup;
  plans: Plan[] = [];
  idOf = idOf;

  constructor(@Inject(MAT_DIALOG_DATA) public data: RenewDialogData) {}

  get isOwner(): boolean {
    const r = this.data.subscription.soldBy as Partial<Reseller>;
    return typeof r !== 'string' && !!r.isOwner;
  }

  get sellerLabel(): string {
    const r = this.data.subscription.soldBy as Partial<Reseller>;
    if (typeof r === 'string') return r;
    if (r.isOwner) return 'Owner';
    return r.businessName || `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      changePlan: [false],
      planId: [''],
      salePrice: [this.data.subscription.salePrice, [Validators.min(0)]],
    });

    this.plansService.getAll({ active: true }).subscribe((ps) => (this.plans = ps));
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const v = this.form.getRawValue();
    const payload: SubscriptionRenewPayload = {};
    if (v.changePlan && v.planId) payload.plan = v.planId;
    if (v.salePrice !== null && v.salePrice !== '') payload.salePrice = Number(v.salePrice);
    this.dialogRef.close(payload);
  }
}
