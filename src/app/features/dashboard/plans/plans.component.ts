import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription as RxSub } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Plan } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { PlansActions } from '../../../store/actions/plans.actions';
import {
  selectPlans,
  selectPlansLoading,
  selectPlansSaving,
  selectPlansServiceTypes,
  selectPlansFilter,
} from '../../../store/selectors/plans.selectors';
import {
  PlanFormDialogComponent,
  PlanFormDialogResult,
} from './plan-form-dialog/plan-form-dialog.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  template: `
    <div class="page">
      <header class="head">
        <h2>Planes</h2>
        <button mat-flat-button color="primary" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          Nuevo plan
        </button>
      </header>

      <mat-card class="filters-card">
        <mat-form-field appearance="outline" class="search" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput placeholder="Buscar plan…" [(ngModel)]="search" (ngModelChange)="applyFilter($event)" />
          <button *ngIf="search" matSuffix mat-icon-button (click)="clearSearch()"><mat-icon>close</mat-icon></button>
        </mat-form-field>
        <ng-container *ngIf="(serviceTypes$ | async)?.length">
          <span class="filter-label">Servicio:</span>
          <mat-chip-listbox [value]="(filter$ | async)?.serviceType ?? ''" (change)="onServiceTypeFilter($event.value)">
            <mat-chip-option [value]="''">Todos</mat-chip-option>
            <mat-chip-option *ngFor="let st of (serviceTypes$ | async)" [value]="st">{{ st }}</mat-chip-option>
          </mat-chip-listbox>
        </ng-container>
      </mat-card>

      <mat-card *ngIf="loading$ | async">
        <div class="skeleton skeleton-row" *ngFor="let _ of skeletonRows"></div>
      </mat-card>

      <mat-card *ngIf="!(loading$ | async)">
        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z0">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
            <td mat-cell *matCellDef="let p">
              {{ p.name }}
              <span *ngIf="!p.active" class="inactive-badge">INACTIVO</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="service">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Servicio</th>
            <td mat-cell *matCellDef="let p"><mat-chip [highlighted]="true" disableRipple>{{ p.serviceType }}</mat-chip></td>
          </ng-container>
          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="num">Días</th>
            <td mat-cell *matCellDef="let p" class="num">{{ p.durationDays }}</td>
          </ng-container>
          <ng-container matColumnDef="capacity">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="num">Capacidad</th>
            <td mat-cell *matCellDef="let p" class="num">{{ p.capacity || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="cost">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="num">Costo (cr)</th>
            <td mat-cell *matCellDef="let p" class="num">{{ p.creditCost }}</td>
          </ng-container>
          <ng-container matColumnDef="ownerPrice">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="num">P. Owner</th>
            <td mat-cell *matCellDef="let p" class="num">\${{ p.ownerPrice.toFixed(2) }}</td>
          </ng-container>
          <ng-container matColumnDef="resellerPrice">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="num">P. Sug.</th>
            <td mat-cell *matCellDef="let p" class="num">\${{ p.suggestedResellerPrice.toFixed(2) }}</td>
          </ng-container>
          <ng-container matColumnDef="credentials">
            <th mat-header-cell *matHeaderCellDef>Credenciales</th>
            <td mat-cell *matCellDef="let p">
              <mat-chip-set>
                <mat-chip *ngFor="let f of (p.credentialFields ?? [])" disableRipple class="cred-chip">{{ f }}</mat-chip>
                <span *ngIf="!(p.credentialFields?.length)" class="muted">—</span>
              </mat-chip-set>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-h">Acciones</th>
            <td mat-cell *matCellDef="let p" class="actions-c">
              <button mat-icon-button matTooltip="Editar" [disabled]="(saving$ | async) ?? false" (click)="openEdit(p)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Eliminar" [disabled]="(saving$ | async) ?? false" (click)="confirmDelete(p)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>

        <div *ngIf="dataSource.data.length === 0" class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          <p>Sin planes para el filtro actual.</p>
          <button mat-flat-button color="primary" (click)="openCreate()"><mat-icon>add</mat-icon> Nuevo plan</button>
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
    .filters-card { margin-bottom: 1rem; padding: 0.75rem 1rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .search { width: 280px; max-width: 60vw; }
    .filter-label { font-weight: 500; color: var(--ink-dim); }
    .num { text-align: right; }
    .muted { color: var(--ink-mute); }
    .inactive-badge { margin-left: 0.4rem; padding: 0.1rem 0.4rem; border-radius: 4px; background: var(--crit-soft); color: var(--crit); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; }
    .cred-chip { font-size: 0.75rem; min-height: 22px; }
    .actions-h, .actions-c { width: 110px; text-align: center; }
    table { width: 100%; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: var(--ink-mute); text-align: center; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.5; }
    .empty-state p { margin: 0; }
    .hidden { display: none; }
  `],
})
export class PlansComponent implements OnInit, AfterViewInit, OnDestroy {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  loading$: Observable<boolean> = this.store.select(selectPlansLoading);
  saving$: Observable<boolean> = this.store.select(selectPlansSaving);
  serviceTypes$: Observable<string[]> = this.store.select(selectPlansServiceTypes);
  filter$ = this.store.select(selectPlansFilter);
  private plans$: Observable<Plan[]> = this.store.select(selectPlans);
  private sub?: RxSub;

  dataSource = new MatTableDataSource<Plan>([]);
  cols = ['name', 'service', 'duration', 'capacity', 'cost', 'ownerPrice', 'resellerPrice', 'credentials', 'actions'];
  search = '';
  skeletonRows = Array(6);

  // setters: la tabla vive tras *ngIf (loading), así que el ViewChild no existe
  // en ngAfterViewInit. El setter cablea sort/paginator cuando la tabla se renderiza.
  @ViewChild(MatSort) set matSort(s: MatSort) { if (s) this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }

  ngOnInit(): void {
    this.store.dispatch(PlansActions.load());
    this.store.dispatch(PlansActions.loadServiceTypes());
    this.dataSource.filterPredicate = (p, filter) =>
      `${p.name} ${p.serviceType} ${(p.credentialFields ?? []).join(' ')}`.toLowerCase().includes(filter);
    this.dataSource.sortingDataAccessor = (p, prop) => {
      switch (prop) {
        case 'name': return p.name.toLowerCase();
        case 'service': return p.serviceType.toLowerCase();
        case 'duration': return p.durationDays;
        case 'capacity': return p.capacity ?? 0;
        case 'cost': return p.creditCost;
        case 'ownerPrice': return p.ownerPrice;
        case 'resellerPrice': return p.suggestedResellerPrice;
        default: return (p as any)[prop];
      }
    };
    this.sub = this.plans$.subscribe((list) => (this.dataSource.data = list ?? []));
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

  onServiceTypeFilter(serviceType: string): void {
    this.store.dispatch(PlansActions.setFilter({ filter: { serviceType: serviceType || undefined } }));
  }

  private withServiceTypes(handler: (types: string[]) => void): void {
    this.serviceTypes$.subscribe(handler).unsubscribe();
  }

  openCreate(): void {
    this.withServiceTypes((serviceTypes) => {
      const ref = this.dialog.open(PlanFormDialogComponent, { data: { mode: 'create', serviceTypes } });
      ref.afterClosed().subscribe((result?: PlanFormDialogResult) => {
        if (!result) return;
        this.store.dispatch(PlansActions.create({ payload: result.payload as any }));
      });
    });
  }

  openEdit(plan: Plan): void {
    this.withServiceTypes((serviceTypes) => {
      const ref = this.dialog.open(PlanFormDialogComponent, { data: { mode: 'edit', plan, serviceTypes } });
      ref.afterClosed().subscribe((result?: PlanFormDialogResult) => {
        if (!result || !result.id) return;
        this.store.dispatch(PlansActions.update({ id: result.id, payload: result.payload as any }));
      });
    });
  }

  async confirmDelete(plan: Plan): Promise<void> {
    const ok = await this.notify.confirmDelete(`el plan "${plan.name}"`);
    if (!ok) return;
    const id = plan._id ?? plan.id ?? '';
    this.store.dispatch(PlansActions.delete({ id }));
  }
}
