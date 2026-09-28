import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, combineLatest, map, of, startWith } from 'rxjs';
import {
  EndCustomer,
  Plan,
  Reseller,
  SubscriptionCreatePayload,
} from '../../../../core/models';
import { ResellersService } from '../../../../core/services/resellers.service';
import { EndCustomersService } from '../../../../core/services/end-customers.service';
import { PlansService } from '../../../../core/services/plans.service';

const idOf = (x: { _id?: string; id?: string }): string => x._id ?? x.id ?? '';

@Component({
  selector: 'app-subscription-wizard-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva suscripción</h2>

    <mat-dialog-content class="content">
      <mat-stepper linear #stepper>
        <mat-step [stepControl]="step1">
          <ng-template matStepLabel>Vendedor</ng-template>
          <form [formGroup]="step1" class="step">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Reseller (o Owner)</mat-label>
              <mat-select formControlName="resellerId">
                <mat-option *ngFor="let r of resellers" [value]="idOf(r)">
                  <span *ngIf="r.isOwner">Owner ({{ r.firstName }} {{ r.lastName }})</span>
                  <span *ngIf="!r.isOwner">
                    {{ r.firstName }} {{ r.lastName }}
                    <span class="muted">— saldo {{ r.credits }}cr</span>
                  </span>
                </mat-option>
              </mat-select>
              <mat-hint>Owner no descuenta créditos.</mat-hint>
              <mat-error *ngIf="step1.get('resellerId')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <div class="step-actions">
              <button mat-button type="button" (click)="cancel()">Cancelar</button>
              <button mat-flat-button color="primary" type="button" matStepperNext [disabled]="step1.invalid">
                Siguiente
              </button>
            </div>
          </form>
        </mat-step>

        <mat-step [stepControl]="step2">
          <ng-template matStepLabel>Cliente</ng-template>
          <form [formGroup]="step2" class="step">
            <div class="recap" *ngIf="sellerLabel">
              <span class="recap-k">Vendedor</span>
              <span class="recap-v">{{ sellerLabel }}</span>
            </div>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Cliente final del reseller</mat-label>
              <mat-select formControlName="customerId">
                <mat-option *ngIf="!(filteredCustomers$ | async)?.length" [disabled]="true">
                  Sin clientes para este reseller
                </mat-option>
                <mat-option *ngFor="let c of (filteredCustomers$ | async)" [value]="idOf(c)">
                  {{ c.firstName }} {{ c.lastName }}
                  <span class="muted" *ngIf="c.email">— {{ c.email }}</span>
                </mat-option>
              </mat-select>
              <mat-hint>Sólo lista clientes asignados al reseller del paso 1.</mat-hint>
              <mat-error *ngIf="step2.get('customerId')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <p class="hint" *ngIf="!(filteredCustomers$ | async)?.length">
              Si el reseller no tiene clientes, primero crealos en la sección "Clientes finales".
            </p>
            <div class="step-actions">
              <button mat-button type="button" matStepperPrevious>Atrás</button>
              <button mat-flat-button color="primary" type="button" matStepperNext [disabled]="step2.invalid">
                Siguiente
              </button>
            </div>
          </form>
        </mat-step>

        <mat-step [stepControl]="step3">
          <ng-template matStepLabel>Plan + credenciales</ng-template>
          <form [formGroup]="step3" class="step">
            <div class="recap" *ngIf="sellerLabel">
              <span class="recap-k">Vendedor</span>
              <span class="recap-v">{{ sellerLabel }}</span>
              <span class="recap-sep">·</span>
              <span class="recap-k">Cliente</span>
              <span class="recap-v">{{ customerLabel }}</span>
            </div>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Plan</mat-label>
              <mat-select formControlName="planId" (selectionChange)="onPlanChange($event.value)">
                <mat-option *ngFor="let p of activePlans" [value]="idOf(p)">
                  <strong>{{ p.name }}</strong>
                  <span class="muted">— {{ p.serviceType }} · {{ p.durationDays }}d · {{ p.creditCost }}cr</span>
                </mat-option>
              </mat-select>
              <mat-error *ngIf="step3.get('planId')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Precio de venta (USD)</mat-label>
              <input matInput type="number" min="0" step="0.01" formControlName="salePrice" />
              <mat-hint *ngIf="suggestedPriceHint">{{ suggestedPriceHint }}</mat-hint>
              <mat-error *ngIf="step3.get('salePrice')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>

            <!-- readout de saldo: mismo lenguaje ruled/mono que subscription-detail -->
            <div class="credit-readout" *ngIf="showCreditReadout">
              <div class="cr-cell">
                <span class="cr-k">Saldo</span>
                <span class="cr-v mono">{{ isOwnerSale ? '∞' : creditBalance + 'cr' }}</span>
              </div>
              <ng-container *ngIf="!isOwnerSale">
                <div class="cr-cell">
                  <span class="cr-k">Costo</span>
                  <span class="cr-v mono">−{{ creditCost }}cr</span>
                </div>
                <div class="cr-cell">
                  <span class="cr-k">Tras alta</span>
                  <span class="cr-v mono" [class.good]="hasEnoughCredits" [class.crit]="!hasEnoughCredits">
                    {{ creditAfter }}cr
                  </span>
                </div>
              </ng-container>
              <div class="cr-cell owner" *ngIf="isOwnerSale">
                <span class="cr-k">Owner</span>
                <span class="cr-v">No descuenta</span>
              </div>
            </div>
            <p class="credit-alert" *ngIf="showCreditReadout && !hasEnoughCredits">
              <mat-icon>warning</mat-icon>
              <span>Saldo insuficiente — cargá créditos antes de crear.</span>
            </p>

            <section class="credentials" *ngIf="credentialFields.length" formArrayName="credentials">
              <div class="vault-head"><mat-icon>vpn_key</mat-icon> Credenciales del servicio</div>
              <mat-form-field
                *ngFor="let field of credentialFields; let i = index"
                appearance="outline"
                class="full">
                <mat-label>{{ field }}</mat-label>
                <input matInput [formControlName]="i" autocomplete="off" />
              </mat-form-field>
            </section>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Notas</mat-label>
              <textarea matInput formControlName="notes" rows="2"></textarea>
            </mat-form-field>

            <div class="step-actions">
              <button mat-button type="button" matStepperPrevious>Atrás</button>
              <button
                mat-flat-button
                color="primary"
                type="button"
                [disabled]="step3.invalid || !hasEnoughCredits"
                (click)="submit()">
                Crear suscripción
              </button>
            </div>
          </form>
        </mat-step>
      </mat-stepper>
    </mat-dialog-content>
  `,
  styles: [`
    .content { min-width: 560px; max-width: 640px; padding-top: 0.5rem; }
    @media (max-width: 600px) { .content { min-width: 0; } }
    .step { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem 0; }
    .step-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem; }
    .full { width: 100%; }
    .muted { color: var(--ink-mute); font-size: 0.85rem; margin-left: 0.25rem; }
    .hint { color: var(--ink-mute); font-size: 0.85rem; }

    /* recap de pasos previos: contexto acumulado, ruled sutil */
    .recap {
      display: flex; align-items: baseline; flex-wrap: wrap; gap: .35rem .5rem;
      padding: .55rem .75rem; margin-bottom: .35rem;
      background: var(--surface-2); border: 1px solid var(--border-soft); border-radius: var(--radius-sm);
    }
    .recap-k { font-size: .64rem; text-transform: uppercase; letter-spacing: .09em; color: var(--ink-mute); font-weight: 600; }
    .recap-v { font-size: .85rem; color: var(--ink); font-weight: 500; }
    .recap-sep { color: var(--border); margin: 0 .15rem; }

    /* readout de saldo: strip ruled + cifras mono (lenguaje de subscription-detail) */
    .credit-readout {
      display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
      border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin: .35rem 0 .25rem;
    }
    .cr-cell { padding: .7rem .85rem; border-right: 1px solid var(--border-soft); }
    .cr-cell:last-child { border-right: none; }
    .cr-k { display: block; font-size: .64rem; text-transform: uppercase; letter-spacing: .09em; color: var(--ink-mute); font-weight: 600; }
    .cr-v { display: block; margin-top: .3rem; font-size: 1.15rem; font-weight: 500; color: var(--ink); letter-spacing: -.01em; }
    .cr-v.good { color: var(--good); }
    .cr-v.crit { color: var(--crit); }
    .cr-cell.owner .cr-v { font-size: .9rem; color: var(--ink-dim); }

    .credit-alert {
      display: flex; align-items: center; gap: .45rem; margin: .1rem 0 0;
      font-size: .82rem; color: var(--crit);
    }
    .credit-alert mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* credenciales: vault-head con icono + kicker, igual que subscription-detail */
    .credentials { margin-top: .6rem; padding-top: .6rem; border-top: 1px solid var(--border-soft); }
    .vault-head {
      display: flex; align-items: center; gap: .45rem; margin-bottom: .75rem;
      font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-dim);
    }
    .vault-head mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--accent); }

    /* MatStepper tokenizado a Operator (perfora encapsulación, acotado a :host) */
    /* el wrapper del stepper trae bg propio del theme Material (oscuro); transparente
       deja ver la surface del diálogo → correcto en Día y Noche */
    :host ::ng-deep .mat-stepper-horizontal,
    :host ::ng-deep .mat-horizontal-stepper-wrapper { background: transparent; }
    :host ::ng-deep .mat-step-icon {
      background: var(--surface-2); color: var(--ink-mute);
      font-family: var(--font-mono); font-weight: 600;
    }
    :host ::ng-deep .mat-step-icon-selected,
    :host ::ng-deep .mat-step-icon-state-done,
    :host ::ng-deep .mat-step-icon-state-edit {
      background: var(--accent); color: var(--on-accent);
    }
    :host ::ng-deep .mat-step-label {
      font-family: var(--font-ui); color: var(--ink-mute); font-weight: 500;
    }
    :host ::ng-deep .mat-step-label-selected,
    :host ::ng-deep .mat-step-label-active { color: var(--ink); }
    :host ::ng-deep .mat-stepper-horizontal-line,
    :host ::ng-deep .mat-horizontal-stepper-header::after,
    :host ::ng-deep .mat-horizontal-stepper-header::before { border-top-color: var(--border); }
    :host ::ng-deep .mat-horizontal-stepper-header:hover:not([aria-disabled]),
    :host ::ng-deep .mat-step-header:hover { background: var(--surface-2); }
    :host ::ng-deep .mat-horizontal-content-container { padding: 0 4px 4px; }

    @media (prefers-reduced-motion: reduce) {
      :host ::ng-deep .mat-horizontal-stepper-content { transition: none !important; }
    }
  `],
})
export class SubscriptionWizardDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(
    MatDialogRef<SubscriptionWizardDialogComponent, SubscriptionCreatePayload>
  );
  private resellersService = inject(ResellersService);
  private customersService = inject(EndCustomersService);
  private plansService = inject(PlansService);

  resellers: Reseller[] = [];
  customers: EndCustomer[] = [];
  activePlans: Plan[] = [];

  step1: FormGroup = this.fb.group({
    resellerId: ['', Validators.required],
  });
  step2: FormGroup = this.fb.group({
    customerId: ['', Validators.required],
  });
  step3: FormGroup = this.fb.group({
    planId: ['', Validators.required],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
    credentials: this.fb.array([]),
  });

  filteredCustomers$: Observable<EndCustomer[]> = of([]);
  credentialFields: string[] = [];
  suggestedPriceHint = '';
  creditsWarning = '';
  hasEnoughCredits = true;

  // readout de saldo (valores discretos, pintados con color semántico en el template)
  showCreditReadout = false;
  isOwnerSale = false;
  creditBalance = 0;
  creditCost = 0;
  creditAfter = 0;

  idOf = idOf;

  ngOnInit(): void {
    this.resellersService.getAll({ includeOwner: true }).subscribe((rs) => {
      this.resellers = rs;
    });
    this.customersService.getAll({ active: true }).subscribe((cs) => {
      this.customers = cs;
    });
    this.plansService.getAll({ active: true }).subscribe((ps) => {
      this.activePlans = ps;
    });

    this.filteredCustomers$ = this.step1.get('resellerId')!.valueChanges.pipe(
      startWith(this.step1.get('resellerId')!.value),
      map((resellerId: string) => {
        if (!resellerId) return [];
        return this.customers.filter((c) => {
          const cr = c.reseller;
          if (typeof cr === 'string') return cr === resellerId;
          return idOf(cr as any) === resellerId;
        });
      })
    );

    // when reseller changes, recompute credit warnings
    this.step1.get('resellerId')!.valueChanges.subscribe(() => this.recomputeCredits());
    // also when plan changes, recompute
  }

  get credentialsArray(): FormArray {
    return this.step3.get('credentials') as FormArray;
  }

  onPlanChange(planId: string): void {
    const plan = this.activePlans.find((p) => idOf(p) === planId);
    if (!plan) return;

    this.credentialFields = plan.credentialFields ?? [];
    const reseller = this.currentReseller();
    const suggested = reseller?.isOwner ? plan.ownerPrice : plan.suggestedResellerPrice;
    this.step3.patchValue({ salePrice: suggested });

    this.suggestedPriceHint = reseller?.isOwner
      ? `Precio Owner sugerido: $${plan.ownerPrice.toFixed(2)}`
      : `Precio sugerido reseller: $${plan.suggestedResellerPrice.toFixed(2)}`;

    // rebuild credentials FormArray
    while (this.credentialsArray.length) this.credentialsArray.removeAt(0);
    this.credentialFields.forEach(() => this.credentialsArray.push(new FormControl('')));

    this.recomputeCredits();
  }

  private currentReseller(): Reseller | undefined {
    const id = this.step1.get('resellerId')!.value as string;
    return this.resellers.find((r) => idOf(r) === id);
  }

  private currentPlan(): Plan | undefined {
    const id = this.step3.get('planId')!.value as string;
    return this.activePlans.find((p) => idOf(p) === id);
  }

  private recomputeCredits(): void {
    const reseller = this.currentReseller();
    const plan = this.currentPlan();
    if (!reseller || !plan) {
      this.showCreditReadout = false;
      this.creditsWarning = '';
      this.hasEnoughCredits = true;
      return;
    }
    this.showCreditReadout = true;
    if (reseller.isOwner) {
      this.isOwnerSale = true;
      this.creditsWarning = 'Owner: no se descuentan créditos.';
      this.hasEnoughCredits = true;
      return;
    }
    this.isOwnerSale = false;
    this.creditBalance = reseller.credits;
    this.creditCost = plan.creditCost;
    this.creditAfter = reseller.credits - plan.creditCost;
    this.hasEnoughCredits = this.creditAfter >= 0;
    this.creditsWarning = this.hasEnoughCredits
      ? `Saldo: ${reseller.credits}cr → tras alta: ${this.creditAfter}cr (descuenta ${plan.creditCost}cr).`
      : `Saldo insuficiente: tiene ${reseller.credits}cr, requiere ${plan.creditCost}cr. Cargá créditos antes de crear.`;
  }

  get sellerLabel(): string {
    const r = this.currentReseller();
    if (!r) return '';
    if (r.isOwner) return `Owner (${r.firstName} ${r.lastName})`.trim();
    return `${r.firstName} ${r.lastName}`.trim();
  }

  get customerLabel(): string {
    const id = this.step2.get('customerId')!.value as string;
    const c = this.customers.find((x) => idOf(x) === id);
    return c ? `${c.firstName} ${c.lastName}`.trim() : '';
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.step3.invalid || !this.hasEnoughCredits) return;
    const v3 = this.step3.getRawValue();
    const credentialsObj: Record<string, string> = {};
    this.credentialFields.forEach((field, i) => {
      const value = (v3.credentials[i] ?? '').toString().trim();
      if (value) credentialsObj[field] = value;
    });

    const payload: SubscriptionCreatePayload = {
      endCustomer: this.step2.get('customerId')!.value,
      plan: this.step3.get('planId')!.value,
      soldBy: this.step1.get('resellerId')!.value,
      salePrice: Number(v3.salePrice),
      credentials: Object.keys(credentialsObj).length ? credentialsObj : undefined,
      notes: (v3.notes ?? '').trim() || undefined,
    };
    this.dialogRef.close(payload);
  }
}
