import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription as RxSub, combineLatest, startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  CreditTransaction,
  CreditTransactionType,
  Reseller,
} from '../../../core/models';
import { ResellersService } from '../../../core/services/resellers.service';
import { CreditsActions } from '../../../store/actions/credits.actions';
import {
  selectFilteredCredits,
  selectCreditsLoading,
} from '../../../store/selectors/credits.selectors';

const TYPES: CreditTransactionType[] = ['topup', 'consume', 'refund', 'adjustment'];

@Component({
  selector: 'app-credits',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  template: `
    <div class="page">
      <h2>Movimientos de créditos</h2>

      <mat-card class="filters-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="search" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Buscar reseller, nota…" [(ngModel)]="search" (ngModelChange)="applyFilter($event)" />
            <button *ngIf="search" matSuffix mat-icon-button (click)="clearSearch()"><mat-icon>close</mat-icon></button>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter" subscriptSizing="dynamic">
            <mat-label>Tipo</mat-label>
            <mat-select [formControl]="typeFilter">
              <mat-option [value]="''">Todos</mat-option>
              <mat-option *ngFor="let t of types" [value]="t">{{ typeLabel(t) }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-reseller" subscriptSizing="dynamic">
            <mat-label>Reseller</mat-label>
            <mat-select [formControl]="resellerFilter">
              <mat-option [value]="''">Todos</mat-option>
              <mat-option *ngFor="let r of (resellers$ | async)" [value]="idOf(r)">
                <span *ngIf="r.isOwner">Owner</span>
                <span *ngIf="!r.isOwner">{{ r.firstName }} {{ r.lastName }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter" subscriptSizing="dynamic">
            <mat-label>Desde</mat-label>
            <input matInput [matDatepicker]="fromPicker" [formControl]="fromDateFilter" />
            <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter" subscriptSizing="dynamic">
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

      <mat-card *ngIf="loading$ | async">
        <div class="skeleton skeleton-row" *ngFor="let _ of skeletonRows"></div>
      </mat-card>

      <mat-card *ngIf="!(loading$ | async)">
        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z0">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha</th>
            <td mat-cell *matCellDef="let t">{{ t.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
          </ng-container>
          <ng-container matColumnDef="reseller">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Reseller</th>
            <td mat-cell *matCellDef="let t"><a class="reseller-link" (click)="goToDetail(t)">{{ resellerLabel(t) }}</a></td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
            <td mat-cell *matCellDef="let t"><span class="badge" [ngClass]="t.type">{{ typeLabel(t.type) }}</span></td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="num">Monto</th>
            <td mat-cell *matCellDef="let t" class="num" [class.pos]="t.amount > 0" [class.neg]="t.amount < 0">
              {{ t.amount > 0 ? '+' : '' }}{{ t.amount }}
            </td>
          </ng-container>
          <ng-container matColumnDef="balance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="num">Saldo</th>
            <td mat-cell *matCellDef="let t" class="num">{{ t.balanceAfter }}</td>
          </ng-container>
          <ng-container matColumnDef="note">
            <th mat-header-cell *matHeaderCellDef>Nota</th>
            <td mat-cell *matCellDef="let t">{{ t.note || '-' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>

        <div *ngIf="dataSource.filteredData.length === 0" class="empty-state">
          <mat-icon>account_balance_wallet</mat-icon>
          <p>Sin movimientos para el filtro actual.</p>
          <button mat-stroked-button (click)="clearFilters(); clearSearch()">Limpiar filtros</button>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]" [pageSize]="10"
          [class.hidden]="dataSource.filteredData.length === 0" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .filters-card { margin-bottom: 1rem; padding: 0.5rem 1rem; }
    .filters { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .search { width: 220px; }
    .filter { min-width: 140px; margin: 0; }
    .filter-reseller { min-width: 200px; margin: 0; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .pos { color: var(--good); font-weight: 600; }
    .neg { color: var(--crit); font-weight: 600; }
    .reseller-link { color: var(--cyan); cursor: pointer; text-decoration: underline; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; }
    .badge.topup { background: var(--good-soft); color: var(--good); }
    .badge.consume { background: var(--warn-soft); color: var(--warn); }
    .badge.refund { background: var(--surface-2); color: var(--cyan); }
    .badge.adjustment { background: var(--surface-2); color: var(--ink-dim); }
    table { width: 100%; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: var(--ink-mute); text-align: center; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.5; }
    .empty-state p { margin: 0; }
    .hidden { display: none; }
  `],
})
export class CreditsComponent implements OnInit, AfterViewInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private resellersService = inject(ResellersService);

  loading$: Observable<boolean> = this.store.select(selectCreditsLoading);
  resellers$: Observable<Reseller[]> = this.resellersService.getAll({ includeOwner: true });
  private transactions$: Observable<CreditTransaction[]> = this.store.select(selectFilteredCredits);
  private sub?: RxSub;

  dataSource = new MatTableDataSource<CreditTransaction>([]);
  typeFilter = new FormControl<string>('', { nonNullable: true });
  resellerFilter = new FormControl<string>('', { nonNullable: true });
  fromDateFilter = new FormControl<Date | null>(null);
  toDateFilter = new FormControl<Date | null>(null);

  types = TYPES;
  cols = ['date', 'reseller', 'type', 'amount', 'balance', 'note'];
  search = '';
  skeletonRows = Array(6);

  // setters: la tabla vive tras *ngIf (loading), así que el ViewChild no existe
  // en ngAfterViewInit. El setter cablea sort/paginator cuando la tabla se renderiza.
  @ViewChild(MatSort) set matSort(s: MatSort) { if (s) this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }

  idOf = (r: Reseller): string => r._id ?? r.id ?? '';

  ngOnInit(): void {
    this.dataSource.filterPredicate = (t, filter) =>
      `${this.resellerLabel(t)} ${t.note ?? ''} ${this.typeLabel(t.type)} ${t.amount}`.toLowerCase().includes(filter);
    this.dataSource.sortingDataAccessor = (t, prop) => {
      switch (prop) {
        case 'date': return new Date(t.createdAt ?? 0).getTime();
        case 'reseller': return this.resellerLabel(t).toLowerCase();
        case 'type': return t.type;
        case 'amount': return t.amount;
        case 'balance': return t.balanceAfter;
        default: return (t as any)[prop];
      }
    };
    this.sub = this.transactions$.subscribe((list) => (this.dataSource.data = list ?? []));

    combineLatest([
      this.typeFilter.valueChanges.pipe(startWith(this.typeFilter.value)),
      this.resellerFilter.valueChanges.pipe(startWith(this.resellerFilter.value)),
      this.fromDateFilter.valueChanges.pipe(startWith(this.fromDateFilter.value)),
      this.toDateFilter.valueChanges.pipe(startWith(this.toDateFilter.value)),
    ]).subscribe(([type, reseller, from, to]) => {
      this.store.dispatch(
        CreditsActions.setFilter({
          filter: {
            type: (type as CreditTransactionType) || undefined,
            reseller: reseller || undefined,
            fromDate: from ? from.toISOString() : undefined,
            toDate: to ? to.toISOString() : undefined,
          },
        })
      );
    });
  }

  ngAfterViewInit(): void {
    // sort/paginator se cablean vía los setters @ViewChild (la tabla está tras *ngIf).
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  applyFilter(value: string): void {
    this.dataSource.filter = (value ?? '').trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  clearSearch(): void {
    this.search = '';
    this.applyFilter('');
  }

  clearFilters(): void {
    this.typeFilter.setValue('');
    this.resellerFilter.setValue('');
    this.fromDateFilter.setValue(null);
    this.toDateFilter.setValue(null);
  }

  resellerLabel(t: CreditTransaction): string {
    const r = t.reseller as Partial<Reseller> | null | undefined;
    if (!r) return '(eliminado)';
    if (typeof r === 'string') return r;
    if (r.isOwner) return 'Owner';
    return r.businessName || `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '-';
  }

  goToDetail(t: CreditTransaction): void {
    const r = t.reseller as Partial<Reseller> | null | undefined;
    if (!r) return;
    const id = typeof r === 'string' ? r : r._id;
    if (id) this.router.navigate(['/dashboard/credits', id]);
  }

  typeLabel(type: string): string {
    return (
      { topup: 'Carga', consume: 'Consumo', refund: 'Devolución', adjustment: 'Ajuste' } as Record<string, string>
    )[type] || type;
  }
}
