import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription as RxSub, combineLatest, startWith, map, of, switchMap, take } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EndCustomer, Reseller } from '../../../core/models';
import { ResellersService } from '../../../core/services/resellers.service';
import { NotificationService } from '../../../core/services/notification.service';
import { selectAuthUser } from '../../../store/selectors/auth.selectors';
import { EndCustomersActions } from '../../../store/actions/end-customers.actions';
import {
  selectEndCustomers,
  selectEndCustomersLoading,
  selectEndCustomersSaving,
} from '../../../store/selectors/end-customers.selectors';
import {
  EndCustomerFormDialogComponent,
  EndCustomerFormDialogResult,
} from './end-customer-form-dialog/end-customer-form-dialog.component';

@Component({
  selector: 'app-end-customers',
  standalone: true,
  imports: [
    CommonModule,
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
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDialogModule,
  ],
  template: `
    <div class="page">
      <header class="head">
        <h2>Clientes finales</h2>
        <button *ngIf="isAdmin$ | async" mat-flat-button color="primary" [disabled]="!(resellers$ | async)?.length" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          Nuevo cliente
        </button>
      </header>

      <mat-card class="filters-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="search" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Buscar nombre, email, teléfono…"
                   [(ngModel)]="search" (ngModelChange)="applyFilter($event)" />
            <button *ngIf="search" matSuffix mat-icon-button (click)="clearSearch()"><mat-icon>close</mat-icon></button>
          </mat-form-field>

          <mat-form-field *ngIf="isAdmin$ | async" appearance="outline" class="filter-reseller" subscriptSizing="dynamic">
            <mat-label>Filtrar por reseller</mat-label>
            <mat-select [formControl]="resellerFilter">
              <mat-option [value]="''">Todos</mat-option>
              <mat-option *ngFor="let r of (resellers$ | async)" [value]="idOf(r)">
                <span *ngIf="r.isOwner">Owner ({{ r.firstName }} {{ r.lastName }})</span>
                <span *ngIf="!r.isOwner">{{ r.firstName }} {{ r.lastName }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-slide-toggle [formControl]="onlyActive" class="active-toggle">Sólo activos</mat-slide-toggle>
        </div>
      </mat-card>

      <mat-card *ngIf="loading$ | async">
        <div class="skeleton skeleton-row" *ngFor="let _ of skeletonRows"></div>
      </mat-card>

      <mat-card *ngIf="!(loading$ | async)">
        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z0">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
            <td mat-cell *matCellDef="let c">{{ c.firstName }} {{ c.lastName }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let c">{{ c.email || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Teléfono</th>
            <td mat-cell *matCellDef="let c">{{ c.phone || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="reseller">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Reseller</th>
            <td mat-cell *matCellDef="let c">{{ getResellerLabel(c) }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
            <td mat-cell *matCellDef="let c">
              <span class="badge" [class.ok]="c.active" [class.off]="!c.active">{{ c.active ? 'Activo' : 'Inactivo' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-h">Acciones</th>
            <td mat-cell *matCellDef="let c" class="actions-c">
              <button mat-icon-button matTooltip="Editar" [disabled]="(saving$ | async) ?? false" (click)="openEdit(c)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Eliminar" [disabled]="(saving$ | async) ?? false" (click)="confirmDelete(c)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>

        <div *ngIf="dataSource.data.length === 0" class="empty-state">
          <mat-icon>people_outline</mat-icon>
          <p>Sin clientes finales para el filtro actual.</p>
          <button *ngIf="isAdmin$ | async" mat-flat-button color="primary" [disabled]="!(resellers$ | async)?.length" (click)="openCreate()">
            <mat-icon>add</mat-icon> Nuevo cliente
          </button>
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
    .page { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .head h2 { margin: 0; }
    .filters-card { margin-bottom: 1rem; padding: 0.5rem 1rem; }
    .filters { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
    .search { width: 300px; max-width: 60vw; }
    .filter-reseller { min-width: 260px; margin: 0; }
    .active-toggle { margin-bottom: 0.25rem; }
    .empty { padding: 1.5rem; text-align: center; color: var(--ink-mute); }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; }
    .badge.ok { background: var(--good-soft); color: var(--good); }
    .badge.off { background: var(--crit-soft); color: var(--crit); }
    .actions-h, .actions-c { width: 110px; text-align: center; }
    table { width: 100%; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: var(--ink-mute); text-align: center; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.5; }
    .empty-state p { margin: 0; }
    .hidden { display: none; }
  `],
})
export class EndCustomersComponent implements OnInit, AfterViewInit, OnDestroy {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);
  private resellersService = inject(ResellersService);

  loading$: Observable<boolean> = this.store.select(selectEndCustomersLoading);
  saving$: Observable<boolean> = this.store.select(selectEndCustomersSaving);
  isAdmin$: Observable<boolean> = this.store
    .select(selectAuthUser)
    .pipe(map((u) => u?.role === 'admin'));
  private customers$: Observable<EndCustomer[]> = this.store.select(selectEndCustomers);
  private sub?: RxSub;

  dataSource = new MatTableDataSource<EndCustomer>([]);
  resellerFilter = new FormControl<string>('', { nonNullable: true });
  onlyActive = new FormControl<boolean>(false, { nonNullable: true });
  // El endpoint /api/resellers es admin-only (403 para reseller): no lo llamamos.
  resellers$: Observable<Reseller[]> = this.store.select(selectAuthUser).pipe(
    take(1),
    switchMap((u) =>
      u?.role === 'admin' ? this.resellersService.getAll({ includeOwner: true }) : of([])
    )
  );

  cols = ['name', 'email', 'phone', 'reseller', 'status', 'actions'];
  search = '';
  skeletonRows = Array(6);

  // setters: la tabla vive tras *ngIf (loading), así que el ViewChild no existe
  // en ngAfterViewInit. El setter cablea sort/paginator cuando la tabla se renderiza.
  @ViewChild(MatSort) set matSort(s: MatSort) { if (s) this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }

  idOf = (r: Reseller): string => r._id ?? r.id ?? '';

  ngOnInit(): void {
    // Reseller: vista read-only → sin columna de acciones (writes son 403).
    this.store
      .select(selectAuthUser)
      .pipe(take(1))
      .subscribe((u) => {
        this.cols =
          u?.role === 'admin'
            ? ['name', 'email', 'phone', 'reseller', 'status', 'actions']
            : ['name', 'email', 'phone', 'reseller', 'status'];
      });

    this.dataSource.filterPredicate = (c, filter) =>
      `${c.firstName} ${c.lastName} ${c.email ?? ''} ${c.phone ?? ''} ${this.getResellerLabel(c)}`
        .toLowerCase().includes(filter);
    this.dataSource.sortingDataAccessor = (c, prop) => {
      switch (prop) {
        case 'name': return `${c.firstName} ${c.lastName}`.toLowerCase();
        case 'reseller': return this.getResellerLabel(c).toLowerCase();
        case 'status': return c.active ? 1 : 0;
        default: return ((c as any)[prop] ?? '').toString().toLowerCase();
      }
    };
    this.sub = this.customers$.subscribe((list) => (this.dataSource.data = list ?? []));

    combineLatest([
      this.resellerFilter.valueChanges.pipe(startWith(this.resellerFilter.value)),
      this.onlyActive.valueChanges.pipe(startWith(this.onlyActive.value)),
    ]).subscribe(([reseller, only]) => {
      this.store.dispatch(
        EndCustomersActions.setFilter({
          filter: { reseller: reseller || undefined, active: only ? true : undefined },
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

  getResellerLabel(c: EndCustomer): string {
    if (typeof c.reseller === 'string') return c.reseller;
    if (c.reseller?.isOwner) return 'Owner';
    const name = `${c.reseller?.firstName ?? ''} ${c.reseller?.lastName ?? ''}`.trim();
    return c.reseller?.businessName ? `${name} — ${c.reseller.businessName}` : name || '-';
  }

  private withResellers(handler: (resellers: Reseller[]) => void): void {
    this.resellers$.subscribe(handler);
  }

  openCreate(): void {
    this.withResellers((resellers) => {
      const ref = this.dialog.open(EndCustomerFormDialogComponent, { data: { mode: 'create', resellers } });
      ref.afterClosed().subscribe((result?: EndCustomerFormDialogResult) => {
        if (!result) return;
        this.store.dispatch(EndCustomersActions.create({ payload: result.payload as any }));
      });
    });
  }

  openEdit(customer: EndCustomer): void {
    this.withResellers((resellers) => {
      const ref = this.dialog.open(EndCustomerFormDialogComponent, { data: { mode: 'edit', customer, resellers } });
      ref.afterClosed().subscribe((result?: EndCustomerFormDialogResult) => {
        if (!result || !result.id) return;
        this.store.dispatch(EndCustomersActions.update({ id: result.id, payload: result.payload as any }));
      });
    });
  }

  async confirmDelete(customer: EndCustomer): Promise<void> {
    const name = `${customer.firstName} ${customer.lastName}`;
    const ok = await this.notify.confirmDelete(`el cliente ${name}`);
    if (!ok) return;
    const id = customer._id ?? customer.id ?? '';
    this.store.dispatch(EndCustomersActions.delete({ id }));
  }
}
