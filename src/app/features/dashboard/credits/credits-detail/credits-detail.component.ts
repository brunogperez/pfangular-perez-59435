import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  CreditTransaction,
  CreditTransactionType,
  Reseller,
} from '../../../../core/models';
import { ResellersService } from '../../../../core/services/resellers.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CreditsActions } from '../../../../store/actions/credits.actions';
import {
  selectFilteredCredits,
  selectCreditsLoading,
} from '../../../../store/selectors/credits.selectors';
import { TopupDialogComponent } from '../../resellers/topup-dialog/topup-dialog.component';
import { AdjustDialogComponent } from '../../resellers/adjust-dialog/adjust-dialog.component';

const TYPES: CreditTransactionType[] = ['topup', 'consume', 'refund', 'adjustment'];

@Component({
  selector: 'app-credits-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatDialogModule,
  ],
  template: `
    <div class="page">
      <header class="head">
        <div>
          <a routerLink="/dashboard/credits" class="back">
            <mat-icon>arrow_back</mat-icon> Volver al listado
          </a>
          <h2>Detalle de créditos</h2>
        </div>
      </header>

      <mat-card *ngIf="reseller" class="reseller-card">
        <div class="reseller-info">
          <div>
            <h3>
              {{ reseller.firstName }} {{ reseller.lastName }}
              <span *ngIf="reseller.isOwner" class="owner-badge">OWNER</span>
            </h3>
            <p class="meta" *ngIf="reseller.businessName">{{ reseller.businessName }}</p>
            <p class="meta">{{ reseller.email }}</p>
          </div>
          <div class="balance">
            <span class="balance-label">Saldo actual</span>
            <span class="balance-value mono" *ngIf="!reseller.isOwner">
              {{ reseller.credits }}<span class="unit">cr</span>
            </span>
            <span class="balance-value mono owner" *ngIf="reseller.isOwner">∞</span>
          </div>
        </div>
        <div class="actions" *ngIf="!reseller.isOwner">
          <button mat-flat-button color="primary" (click)="openTopup()">
            <mat-icon>add_circle</mat-icon>
            Cargar créditos
          </button>
          <button mat-stroked-button (click)="openAdjust()">
            <mat-icon>tune</mat-icon>
            Ajustar saldo
          </button>
        </div>
        <p *ngIf="reseller.isOwner" class="owner-note">
          <mat-icon>info</mat-icon>
          Owner no descuenta créditos. Este historial es vacío por diseño.
        </p>
      </mat-card>

      <mat-card class="filters-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="filter">
            <mat-label>Tipo</mat-label>
            <mat-select [formControl]="typeFilter">
              <mat-option [value]="''">Todos</mat-option>
              <mat-option *ngFor="let t of types" [value]="t">{{ typeLabel(t) }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter">
            <mat-label>Desde</mat-label>
            <input matInput [matDatepicker]="fromPicker" [formControl]="fromDateFilter" />
            <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter">
            <mat-label>Hasta</mat-label>
            <input matInput [matDatepicker]="toPicker" [formControl]="toDateFilter" />
            <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
            <mat-datepicker #toPicker></mat-datepicker>
          </mat-form-field>

          <button mat-stroked-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
            Limpiar
          </button>
        </div>
      </mat-card>

      <div *ngIf="loading$ | async" class="loading">
        <mat-spinner diameter="32"></mat-spinner>
      </div>

      <mat-card *ngIf="!(loading$ | async)">
        <table mat-table [dataSource]="(transactions$ | async) ?? []" class="mat-elevation-z0">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let t">{{ t.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Tipo</th>
            <td mat-cell *matCellDef="let t">
              <span class="badge" [ngClass]="t.type">{{ typeLabel(t.type) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef class="num">Monto</th>
            <td mat-cell *matCellDef="let t" class="num" [class.pos]="t.amount > 0" [class.neg]="t.amount < 0">
              {{ t.amount > 0 ? '+' : '' }}{{ t.amount }}
            </td>
          </ng-container>

          <ng-container matColumnDef="balance">
            <th mat-header-cell *matHeaderCellDef class="num">Saldo</th>
            <td mat-cell *matCellDef="let t" class="num">{{ t.balanceAfter }}</td>
          </ng-container>

          <ng-container matColumnDef="note">
            <th mat-header-cell *matHeaderCellDef>Nota</th>
            <td mat-cell *matCellDef="let t">{{ t.note || '-' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>
        <p *ngIf="!((transactions$ | async)?.length)" class="empty">
          Sin movimientos para el filtro actual.
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .head { margin-bottom: 1rem; }
    .head h2 { margin: 0.5rem 0 0; }
    .back { display: inline-flex; align-items: center; gap: 0.25rem; color: var(--cyan); text-decoration: none; font-size: 0.9rem; }
    .reseller-card { padding: 1.15rem 1.35rem; margin-bottom: 1rem; }
    .reseller-info { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    .reseller-info h3 { margin: 0 0 0.25rem; font-size: 1.2rem; letter-spacing: -.01em; }
    .meta { margin: 0.1rem 0; color: var(--ink-dim); font-size: 0.9rem; }
    /* saldo grande: readout ruled + cifra mono ámbar (identidad Operator) */
    .balance {
      text-align: right; padding: .55rem .9rem;
      border: 1px solid var(--border); border-radius: 10px; background: var(--surface-2);
    }
    .balance-label { display: block; color: var(--ink-mute); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.09em; font-weight: 600; }
    .balance-value { display: block; margin-top: .2rem; font-size: 2rem; font-weight: 500; color: var(--accent-ink); letter-spacing: -.02em; line-height: 1.05; }
    .balance-value .unit { font-size: 0.9rem; color: var(--ink-mute); margin-left: .15rem; font-weight: 400; }
    .balance-value.owner { color: var(--accent-ink); }
    @media (max-width: 560px) { .reseller-info { flex-direction: column; } .balance { text-align: left; align-self: stretch; } }
    .actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .owner-note { display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0 0; color: var(--ink-mute); font-size: 0.9rem; }
    .owner-badge { margin-left: 0.4rem; padding: 0.1rem 0.4rem; border-radius: 4px; background: var(--warn-soft); color: var(--warn); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; }
    .filters-card { margin-bottom: 1rem; padding: 0.5rem 1rem; }
    .filters { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .filter { min-width: 140px; margin: 0; }
    .loading { display: flex; justify-content: center; padding: 2rem; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .pos { color: var(--good); font-weight: 600; }
    .neg { color: var(--crit); font-weight: 600; }
    .empty { padding: 1.5rem; text-align: center; color: var(--ink-mute); }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; }
    .badge.topup { background: var(--good-soft); color: var(--good); }
    .badge.consume { background: var(--warn-soft); color: var(--warn); }
    .badge.refund { background: var(--surface-2); color: var(--cyan); }
    .badge.adjustment { background: var(--surface-2); color: var(--ink-dim); }
    table { width: 100%; }
  `],
})
export class CreditsDetailComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private resellersService = inject(ResellersService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  reseller: Reseller | null = null;
  transactions$: Observable<CreditTransaction[]> = this.store.select(selectFilteredCredits);
  loading$: Observable<boolean> = this.store.select(selectCreditsLoading);

  typeFilter = new FormControl<string>('', { nonNullable: true });
  fromDateFilter = new FormControl<Date | null>(null);
  toDateFilter = new FormControl<Date | null>(null);

  types = TYPES;
  cols = ['date', 'type', 'amount', 'balance', 'note'];

  ngOnInit(): void {
    const resellerId = this.route.snapshot.paramMap.get('id');
    if (!resellerId) return;

    this.resellersService.getById(resellerId).subscribe((r) => (this.reseller = r));

    combineLatest([
      this.typeFilter.valueChanges.pipe(startWith(this.typeFilter.value)),
      this.fromDateFilter.valueChanges.pipe(startWith(this.fromDateFilter.value)),
      this.toDateFilter.valueChanges.pipe(startWith(this.toDateFilter.value)),
    ]).subscribe(([type, from, to]) => {
      this.store.dispatch(
        CreditsActions.setFilter({
          filter: {
            reseller: resellerId,
            type: (type as CreditTransactionType) || undefined,
            fromDate: from ? from.toISOString() : undefined,
            toDate: to ? to.toISOString() : undefined,
          },
        })
      );
    });
  }

  openTopup(): void {
    if (!this.reseller) return;
    const ref = this.dialog.open(TopupDialogComponent, {
      data: { reseller: this.reseller },
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.resellersService.topup(result.id, result.payload).subscribe({
        next: ({ reseller }) => {
          this.reseller = reseller;
          this.notify.showSuccess('Créditos cargados.');
          this.store.dispatch(CreditsActions.load());
        },
        error: (e) => this.notify.showError(e?.error?.message ?? 'Error al cargar créditos'),
      });
    });
  }

  openAdjust(): void {
    if (!this.reseller) return;
    const ref = this.dialog.open(AdjustDialogComponent, {
      data: { reseller: this.reseller },
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.resellersService.adjust(result.id, result.payload).subscribe({
        next: ({ reseller }) => {
          this.reseller = reseller;
          this.notify.showSuccess('Saldo ajustado.');
          this.store.dispatch(CreditsActions.load());
        },
        error: (e) => this.notify.showError(e?.error?.message ?? 'Error al ajustar saldo'),
      });
    });
  }

  clearFilters(): void {
    this.typeFilter.setValue('');
    this.fromDateFilter.setValue(null);
    this.toDateFilter.setValue(null);
  }

  typeLabel(type: string): string {
    return (
      { topup: 'Carga', consume: 'Consumo', refund: 'Devolución', adjustment: 'Ajuste' } as Record<
        string,
        string
      >
    )[type] || type;
  }
}
