import { Component, Inject, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  EndCustomer,
  Reseller,
  Subscription,
} from '../../../../core/models';

export interface SubscriptionDetailDialogData {
  subscription: Subscription;
}

const SECRET_KEYS = ['password', 'pass', 'pwd', 'secret', 'token', 'apiKey'];
const isSecret = (key: string): boolean =>
  SECRET_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()));

interface CredEntry {
  key: string;
  value: string;
  secret: boolean;
  revealed: boolean;
  copied: boolean;
}

@Component({
  selector: 'app-subscription-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <h2 mat-dialog-title>Detalle de suscripción</h2>

    <mat-dialog-content class="content">
      <!-- cabecera: plan + servicio + estado -->
      <header class="dhead">
        <div class="dhead-main">
          <span class="svc">{{ s.planSnapshot.serviceType }}</span>
          <h3 class="plan">{{ s.planSnapshot.name }}</h3>
        </div>
        <span class="status" [ngClass]="s.status">{{ statusLabel }}</span>
      </header>

      <!-- readout -->
      <div class="readout">
        <div class="ro lead">
          <span class="k">Precio de venta</span>
          <span class="v mono">\${{ s.salePrice.toFixed(2) }}</span>
        </div>
        <div class="ro">
          <span class="k">Vence</span>
          <span class="v mono">{{ s.endDate | date:'dd/MM/yyyy':'UTC' }}</span>
        </div>
        <div class="ro" *ngIf="s.daysRemaining !== undefined">
          <span class="k">Días restantes</span>
          <span class="v mono" [class.warn]="s.daysRemaining < 7" [class.expired]="s.daysRemaining <= 0">
            {{ s.daysRemaining }}
          </span>
        </div>
      </div>

      <!-- datos -->
      <dl class="kv">
        <div><dt>Cliente</dt><dd>{{ customerLabel }}</dd></div>
        <div><dt>Vendido por</dt><dd>{{ sellerLabel }}</dd></div>
        <div><dt>Inicio</dt><dd class="mono">{{ s.startDate | date:'dd/MM/yyyy':'UTC' }}</dd></div>
        <div><dt>Duración</dt><dd class="mono">{{ s.planSnapshot.durationDays }} días</dd></div>
        <div *ngIf="s.planSnapshot.capacity"><dt>Capacidad</dt><dd class="mono">{{ s.planSnapshot.capacity }}</dd></div>
        <div><dt>Costo</dt><dd class="mono">{{ s.planSnapshot.creditCost }} cr</dd></div>
      </dl>

      <!-- credenciales -->
      <section class="vault" *ngIf="credentialEntries.length">
        <div class="vault-head"><mat-icon>vpn_key</mat-icon> Credenciales</div>
        <div class="cred" *ngFor="let e of credentialEntries">
          <span class="cred-key">{{ e.key }}</span>
          <span class="cred-val mono" [class.masked]="e.secret && !e.revealed">
            {{ e.secret && !e.revealed ? '••••••••••' : e.value }}
          </span>
          <div class="cred-actions">
            <button *ngIf="e.secret" mat-icon-button type="button"
              [matTooltip]="e.revealed ? 'Ocultar' : 'Mostrar'"
              [attr.aria-label]="e.revealed ? 'Ocultar' : 'Mostrar'"
              (click)="toggleReveal(e)">
              <mat-icon>{{ e.revealed ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <button mat-icon-button type="button"
              [matTooltip]="e.copied ? 'Copiado' : 'Copiar'" aria-label="Copiar"
              [class.copied]="e.copied" (click)="copy(e)">
              <mat-icon>{{ e.copied ? 'check' : 'content_copy' }}</mat-icon>
            </button>
          </div>
        </div>
      </section>

      <!-- notas -->
      <section class="notes" *ngIf="s.notes">
        <div class="kicker">Notas</div>
        <p>{{ s.notes }}</p>
      </section>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="close()">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .content { min-width: 420px; max-width: 560px; }
    @media (max-width: 560px) { .content { min-width: 0; } }

    /* cabecera */
    .dhead { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.1rem; }
    .dhead-main { display: flex; flex-direction: column; gap: .5rem; }
    .svc {
      align-self: flex-start;
      font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .08em;
      background: var(--accent); color: var(--on-accent); padding: .15rem .5rem; border-radius: 5px;
    }
    .plan { margin: 0; font-size: 1.3rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink); }
    .status {
      font-family: var(--font-mono); font-size: .7rem; font-weight: 700; letter-spacing: .04em;
      text-transform: uppercase; padding: .25rem .6rem; border-radius: 6px; white-space: nowrap;
    }
    .status.active { background: var(--good-soft); color: var(--good); }
    .status.expired { background: var(--warn-soft); color: var(--warn); }
    .status.cancelled { background: var(--crit-soft); color: var(--crit); }
    .status.suspended { background: var(--surface-2); color: var(--ink-dim); }

    /* readout */
    .readout {
      display: grid; grid-template-columns: repeat(3, 1fr);
      border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 1.2rem;
    }
    .ro { padding: .8rem .9rem; border-right: 1px solid var(--border-soft); }
    .ro:last-child { border-right: none; }
    .ro .k { display: block; font-size: .66rem; text-transform: uppercase; letter-spacing: .09em; color: var(--ink-mute); font-weight: 600; }
    .ro .v { display: block; margin-top: .35rem; font-size: 1.25rem; font-weight: 500; color: var(--ink); letter-spacing: -.01em; }
    .ro.lead .v { color: var(--accent-ink); }
    .ro .v.warn { color: var(--warn); } .ro .v.expired { color: var(--crit); }

    /* key/value */
    .kv { margin: 0 0 1.2rem; display: flex; flex-direction: column; }
    .kv > div {
      display: flex; justify-content: space-between; align-items: baseline; gap: 1rem;
      padding: .6rem 0; border-bottom: 1px solid var(--border-soft);
    }
    .kv > div:last-child { border-bottom: none; }
    .kv dt { color: var(--ink-mute); font-size: .85rem; }
    .kv dd { margin: 0; color: var(--ink); font-weight: 500; text-align: right; }

    /* vault de credenciales */
    .vault { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 1.1rem; }
    .vault-head {
      display: flex; align-items: center; gap: .45rem;
      padding: .7rem .9rem; border-bottom: 1px solid var(--border-soft);
      font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-dim);
      background: var(--surface-2);
    }
    .vault-head mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--accent); }
    .cred {
      display: grid; grid-template-columns: 120px 1fr auto; align-items: center; gap: .6rem;
      padding: .45rem .9rem; border-bottom: 1px solid var(--border-soft);
    }
    .cred:last-child { border-bottom: none; }
    .cred-key { font-size: .82rem; color: var(--ink-mute); }
    .cred-val { font-size: .88rem; color: var(--ink); word-break: break-all; }
    .cred-val.masked { letter-spacing: .18em; color: var(--ink-dim); }
    .cred-actions { display: flex; gap: .1rem; }
    .cred-actions .mat-mdc-icon-button { width: 34px; height: 34px; padding: 5px; }
    .cred-actions .copied .mat-icon { color: var(--good); }

    /* notas */
    .kicker { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-mute); margin-bottom: .4rem; }
    .notes p { margin: 0; color: var(--ink-dim); font-size: .9rem; line-height: 1.55; }
  `],
})
export class SubscriptionDetailDialogComponent {
  private dialogRef = inject(MatDialogRef<SubscriptionDetailDialogComponent>);

  s: Subscription;
  credentialEntries: CredEntry[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: SubscriptionDetailDialogData) {
    this.s = data.subscription;
    const creds = this.s.credentials ?? {};
    this.credentialEntries = Object.entries(creds).map(([key, value]) => ({
      key,
      value: String(value),
      secret: isSecret(key),
      revealed: false,
      copied: false,
    }));
  }

  get statusLabel(): string {
    const map: Record<string, string> = {
      active: 'Activa', expired: 'Vencida', cancelled: 'Cancelada', suspended: 'Suspendida',
    };
    return map[this.s.status] ?? this.s.status;
  }

  get customerLabel(): string {
    const c = this.s.endCustomer as Partial<EndCustomer>;
    if (typeof c === 'string') return c;
    return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
  }

  get sellerLabel(): string {
    const r = this.s.soldBy as Partial<Reseller>;
    if (typeof r === 'string') return r;
    if (r.isOwner) return 'Owner';
    return r.businessName || `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
  }

  toggleReveal(entry: CredEntry): void {
    entry.revealed = !entry.revealed;
  }

  copy(entry: CredEntry): void {
    navigator.clipboard?.writeText(entry.value);
    entry.copied = true;
    setTimeout(() => (entry.copied = false), 1400);
  }

  close(): void {
    this.dialogRef.close();
  }
}
