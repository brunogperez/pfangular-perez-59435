import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription as RxSub, combineLatest, startWith, map, of, switchMap, take } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  EndCustomer,
  Reseller,
  Subscription,
  SubscriptionStatus,
} from '../../../core/models';
import { ResellersService } from '../../../core/services/resellers.service';
import { PlansService } from '../../../core/services/plans.service';
import { NotificationService } from '../../../core/services/notification.service';
import { selectAuthUser } from '../../../store/selectors/auth.selectors';
import { SubscriptionsActions } from '../../../store/actions/subscriptions.actions';
import {
  selectSubscriptions,
  selectSubscriptionsLoading,
  selectSubscriptionsSaving,
} from '../../../store/selectors/subscriptions.selectors';
import { SubscriptionWizardDialogComponent } from './subscription-wizard-dialog/subscription-wizard-dialog.component';
import { RenewDialogComponent } from './renew-dialog/renew-dialog.component';
import { SubscriptionDetailDialogComponent } from './subscription-detail-dialog/subscription-detail-dialog.component';

const STATUSES: SubscriptionStatus[] = ['active', 'expired', 'cancelled', 'suspended'];

@Component({
  selector: 'app-subscriptions',
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
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
  ],
  template: `
    <div class="page">
      <header class="head">
        <h2>Suscripciones</h2>
        <button *ngIf="isAdmin$ | async" mat-flat-button color="primary" (click)="openWizard()">
          <mat-icon>add</mat-icon>
          Nueva suscripción
        </button>
      </header>

      <mat-card class="filters-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="search" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Buscar cliente, plan…" [(ngModel)]="search" (ngModelChange)="applyFilter($event)" />
            <button *ngIf="search" matSuffix mat-icon-button (click)="clearSearch()"><mat-icon>close</mat-icon></button>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-status" subscriptSizing="dynamic">
            <mat-label>Estado</mat-label>
            <mat-select [formControl]="statusFilter">
              <mat-option [value]="''">Todos</mat-option>
              <mat-option *ngFor="let s of statuses" [value]="s">{{ statusLabel(s) }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field *ngIf="isAdmin$ | async" appearance="outline" class="filter-service" subscriptSizing="dynamic">
            <mat-label>Servicio</mat-label>
            <mat-select [formControl]="serviceFilter">
              <mat-option [value]="''">Todos</mat-option>
              <mat-option *ngFor="let st of (serviceTypes$ | async)" [value]="st">{{ st }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field *ngIf="isAdmin$ | async" appearance="outline" class="filter-seller" subscriptSizing="dynamic">
            <mat-label>Vendido por</mat-label>
            <mat-select [formControl]="sellerFilter">
              <mat-option [value]="''">Todos</mat-option>
              <mat-option *ngFor="let r of (resellers$ | async)" [value]="idOf(r)">
                <span *ngIf="r.isOwner">Owner</span>
                <span *ngIf="!r.isOwner">{{ r.firstName }} {{ r.lastName }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-expiring" subscriptSizing="dynamic">
            <mat-label>Vence en (días)</mat-label>
            <input matInput type="number" min="0" [formControl]="expiringFilter" />
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card *ngIf="loading$ | async">
        <div class="skeleton skeleton-row" *ngFor="let _ of skeletonRows"></div>
      </mat-card>

      <mat-card *ngIf="!(loading$ | async)">
        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z0">
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Cliente</th>
            <td mat-cell *matCellDef="let s">{{ customerLabel(s) }}</td>
          </ng-container>
          <ng-container matColumnDef="service">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Servicio</th>
            <td mat-cell *matCellDef="let s"><mat-chip [highlighted]="true" disableRipple>{{ s.planSnapshot.serviceType }}</mat-chip></td>
          </ng-container>
          <ng-container matColumnDef="plan">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Plan</th>
            <td mat-cell *matCellDef="let s">{{ s.planSnapshot.name }}</td>
          </ng-container>
          <ng-container matColumnDef="soldBy">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Vendido por</th>
            <td mat-cell *matCellDef="let s">{{ sellerLabel(s) }}</td>
          </ng-container>
          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="num">Precio</th>
            <td mat-cell *matCellDef="let s" class="num">\${{ s.salePrice.toFixed(2) }}</td>
          </ng-container>
          <ng-container matColumnDef="end">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Vence</th>
            <td mat-cell *matCellDef="let s">
              {{ s.endDate | date:'dd/MM/yyyy':'UTC' }}
              <span *ngIf="s.daysRemaining !== undefined && s.status === 'active'" class="days"
                [class.warn]="s.daysRemaining < 7" [class.expired]="s.daysRemaining <= 0">({{ s.daysRemaining }}d)</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
            <td mat-cell *matCellDef="let s"><span class="badge" [ngClass]="s.status">{{ statusLabel(s.status) }}</span></td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-h">Acciones</th>
            <td mat-cell *matCellDef="let s" class="actions-c">
              <button mat-icon-button matTooltip="Ver detalle" (click)="openDetail(s)"><mat-icon>visibility</mat-icon></button>
              <ng-container *ngIf="isAdmin$ | async">
                <button mat-icon-button color="primary" matTooltip="Renovar"
                  [disabled]="s.status === 'cancelled' || ((saving$ | async) ?? false)" (click)="openRenew(s)">
                  <mat-icon>refresh</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Cancelar"
                  [disabled]="s.status === 'cancelled' || ((saving$ | async) ?? false)" (click)="confirmCancel(s)">
                  <mat-icon>block</mat-icon>
                </button>
              </ng-container>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>

        <div *ngIf="dataSource.data.length === 0" class="empty-state">
          <mat-icon>subscriptions</mat-icon>
          <p>Sin suscripciones para el filtro actual.</p>
          <button *ngIf="isAdmin$ | async" mat-flat-button color="primary" (click)="openWizard()"><mat-icon>add</mat-icon> Nueva suscripción</button>
        </div>
        <div *ngIf="dataSource.data.length > 0 && dataSource.filteredData.length === 0" class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>Sin resultados para "{{ search }}".</p>
          <button mat-stroked-button (click)="clearSearch()">Limpiar búsqueda</button>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]" [pageSize]="10"
          [class.hidden]="dataSource.filteredData.length === 0" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; max-width: 1500px; margin: 0 auto; }
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .head h2 { margin: 0; }
    .filters-card { margin-bottom: 1rem; padding: 0.5rem 1rem; }
    .filters { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
    .search { width: 240px; }
    .filter-status, .filter-service, .filter-expiring { min-width: 140px; margin: 0; }
    .filter-seller { min-width: 200px; margin: 0; }
    .num { text-align: right; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; text-transform: capitalize; }
    .badge.active { background: var(--good-soft); color: var(--good); }
    .badge.expired { background: var(--warn-soft); color: var(--warn); }
    .badge.cancelled { background: var(--crit-soft); color: var(--crit); }
    .badge.suspended { background: var(--surface-2); color: var(--ink-dim); }
    .days { font-size: 0.85rem; color: var(--ink-mute); }
    .days.warn { color: var(--warn); font-weight: 600; }
    .days.expired { color: var(--crit); font-weight: 600; }
    .actions-h, .actions-c { width: 150px; text-align: center; }
    table { width: 100%; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: var(--ink-mute); text-align: center; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.5; }
    .empty-state p { margin: 0; }
    .hidden { display: none; }
  `],
})
export class SubscriptionsComponent implements OnInit, AfterViewInit, OnDestroy {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);
  private resellersService = inject(ResellersService);
  private plansService = inject(PlansService);

  loading$: Observable<boolean> = this.store.select(selectSubscriptionsLoading);
  saving$: Observable<boolean> = this.store.select(selectSubscriptionsSaving);
  isAdmin$: Observable<boolean> = this.store
    .select(selectAuthUser)
    .pipe(map((u) => u?.role === 'admin'));
  private subscriptions$: Observable<Subscription[]> = this.store.select(selectSubscriptions);
  private sub?: RxSub;

  dataSource = new MatTableDataSource<Subscription>([]);
  // /api/resellers y /api/plans/service-types son admin-only (403 reseller).
  resellers$: Observable<Reseller[]> = this.store.select(selectAuthUser).pipe(
    take(1),
    switchMap((u) =>
      u?.role === 'admin' ? this.resellersService.getAll({ includeOwner: true }) : of([])
    )
  );
  serviceTypes$: Observable<string[]> = this.store.select(selectAuthUser).pipe(
    take(1),
    switchMap((u) => (u?.role === 'admin' ? this.plansService.getServiceTypes() : of([])))
  );

  statusFilter = new FormControl<string>('', { nonNullable: true });
  serviceFilter = new FormControl<string>('', { nonNullable: true });
  sellerFilter = new FormControl<string>('', { nonNullable: true });
  expiringFilter = new FormControl<number | null>(null);

  statuses = STATUSES;
  cols = ['customer', 'service', 'plan', 'soldBy', 'price', 'end', 'status', 'actions'];
  search = '';
  skeletonRows = Array(6);

  // setters: la tabla vive tras *ngIf (loading), así que el ViewChild no existe
  // en ngAfterViewInit. El setter cablea sort/paginator cuando la tabla se renderiza.
  @ViewChild(MatSort) set matSort(s: MatSort) { if (s) this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }

  idOf = (r: Reseller): string => r._id ?? r.id ?? '';

  ngOnInit(): void {
    this.dataSource.filterPredicate = (s, filter) =>
      `${this.customerLabel(s)} ${s.planSnapshot.name} ${s.planSnapshot.serviceType} ${this.sellerLabel(s)}`
        .toLowerCase().includes(filter);
    this.dataSource.sortingDataAccessor = (s, prop) => {
      switch (prop) {
        case 'customer': return this.customerLabel(s).toLowerCase();
        case 'service': return s.planSnapshot.serviceType.toLowerCase();
        case 'plan': return s.planSnapshot.name.toLowerCase();
        case 'soldBy': return this.sellerLabel(s).toLowerCase();
        case 'price': return s.salePrice;
        case 'end': return new Date(s.endDate).getTime();
        case 'status': return s.status;
        default: return (s as any)[prop];
      }
    };
    this.sub = this.subscriptions$.subscribe((list) => (this.dataSource.data = list ?? []));

    combineLatest([
      this.statusFilter.valueChanges.pipe(startWith(this.statusFilter.value)),
      this.serviceFilter.valueChanges.pipe(startWith(this.serviceFilter.value)),
      this.sellerFilter.valueChanges.pipe(startWith(this.sellerFilter.value)),
      this.expiringFilter.valueChanges.pipe(startWith(this.expiringFilter.value)),
    ]).subscribe(([status, serviceType, soldBy, expiring]) => {
      this.store.dispatch(
        SubscriptionsActions.setFilter({
          filter: {
            status: status || undefined,
            serviceType: serviceType || undefined,
            soldBy: soldBy || undefined,
            expiringInDays:
              expiring !== null && expiring !== undefined && Number(expiring) >= 0 ? Number(expiring) : undefined,
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

  statusLabel(status: string): string {
    return (
      { active: 'Activa', expired: 'Vencida', cancelled: 'Cancelada', suspended: 'Suspendida' } as Record<string, string>
    )[status] ?? status;
  }

  applyFilter(value: string): void {
    this.dataSource.filter = (value ?? '').trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  clearSearch(): void {
    this.search = '';
    this.applyFilter('');
  }

  customerLabel(s: Subscription): string {
    const c = s.endCustomer as Partial<EndCustomer>;
    if (typeof c === 'string') return c;
    return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
  }

  sellerLabel(s: Subscription): string {
    const r = s.soldBy as Partial<Reseller>;
    if (typeof r === 'string') return r;
    if (r.isOwner) return 'Owner';
    return r.businessName || `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
  }

  openWizard(): void {
    const ref = this.dialog.open(SubscriptionWizardDialogComponent, { width: '700px' });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.store.dispatch(SubscriptionsActions.create({ payload }));
    });
  }

  openDetail(subscription: Subscription): void {
    this.dialog.open(SubscriptionDetailDialogComponent, { data: { subscription } });
  }

  openRenew(subscription: Subscription): void {
    const ref = this.dialog.open(RenewDialogComponent, { data: { subscription } });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      const id = subscription._id ?? subscription.id ?? '';
      this.store.dispatch(SubscriptionsActions.renew({ id, payload }));
    });
  }

  async confirmCancel(subscription: Subscription): Promise<void> {
    const name = subscription.planSnapshot.name;
    const ok = await this.notify.confirmDelete(`la suscripción "${name}"`);
    if (!ok) return;
    const id = subscription._id ?? subscription.id ?? '';
    this.store.dispatch(SubscriptionsActions.cancel({ id }));
  }
}
