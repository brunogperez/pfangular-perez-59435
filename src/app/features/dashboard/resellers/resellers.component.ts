import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription as RxSub } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Reseller } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { ResellersActions } from '../../../store/actions/resellers.actions';
import {
  selectResellers,
  selectResellersLoading,
  selectResellersSaving,
} from '../../../store/selectors/resellers.selectors';
import {
  ResellerFormDialogComponent,
  ResellerFormDialogResult,
} from './reseller-form-dialog/reseller-form-dialog.component';
import {
  TopupDialogComponent,
  TopupDialogResult,
} from './topup-dialog/topup-dialog.component';
import {
  AdjustDialogComponent,
  AdjustDialogResult,
} from './adjust-dialog/adjust-dialog.component';

@Component({
  selector: 'app-resellers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
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
        <h2>Resellers</h2>
        <div class="head-actions">
          <mat-form-field appearance="outline" class="search" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Buscar nombre, email, negocio…"
                   [(ngModel)]="search" (ngModelChange)="applyFilter($event)" />
            <button *ngIf="search" matSuffix mat-icon-button (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="openCreate()">
            <mat-icon>add</mat-icon>
            Nuevo reseller
          </button>
        </div>
      </header>

      <!-- Skeleton mientras carga -->
      <mat-card *ngIf="loading$ | async">
        <div class="skeleton skeleton-row" *ngFor="let _ of skeletonRows"></div>
      </mat-card>

      <mat-card *ngIf="!(loading$ | async)">
        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z0">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
            <td mat-cell *matCellDef="let r">
              {{ r.firstName }} {{ r.lastName }}
              <span *ngIf="r.isOwner" class="owner-badge" matTooltip="Dueño del sistema">OWNER</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="business">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Negocio</th>
            <td mat-cell *matCellDef="let r">{{ r.businessName || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let r">{{ r.email }}</td>
          </ng-container>

          <ng-container matColumnDef="credits">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="num">Créditos</th>
            <td mat-cell *matCellDef="let r" class="num">
              <span *ngIf="!r.isOwner">{{ r.credits }}</span>
              <span *ngIf="r.isOwner" class="muted">∞</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge" [class.ok]="r.active" [class.off]="!r.active">
                {{ r.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-h">Acciones</th>
            <td mat-cell *matCellDef="let r" class="actions-c">
              <button mat-icon-button matTooltip="Ver detalle créditos" (click)="goToCreditsDetail(r)">
                <mat-icon>account_balance_wallet</mat-icon>
              </button>
              <button mat-icon-button color="primary" matTooltip="Cargar créditos"
                [disabled]="r.isOwner || (saving$ | async)" (click)="openTopup(r)">
                <mat-icon>add_circle</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Ajustar saldo"
                [disabled]="r.isOwner || (saving$ | async)" (click)="openAdjust(r)">
                <mat-icon>tune</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Editar"
                [disabled]="(saving$ | async) ?? false" (click)="openEdit(r)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Eliminar"
                [disabled]="r.isOwner || (saving$ | async)" (click)="confirmDelete(r)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>

        <!-- Empty states con CTA -->
        <div *ngIf="dataSource.data.length === 0" class="empty-state">
          <mat-icon>storefront</mat-icon>
          <p>No hay resellers todavía.</p>
          <button mat-flat-button color="primary" (click)="openCreate()">
            <mat-icon>add</mat-icon> Crear el primero
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
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap; }
    .head h2 { margin: 0; }
    .head-actions { display: flex; gap: 0.75rem; align-items: center; }
    .search { width: 320px; max-width: 60vw; }
    .num { text-align: right; }
    .muted { color: var(--ink-mute); font-size: 1.1rem; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; }
    .badge.ok { background: var(--good-soft); color: var(--good); }
    .badge.off { background: var(--crit-soft); color: var(--crit); }
    .owner-badge { margin-left: 0.4rem; padding: 0.1rem 0.4rem; border-radius: 4px;
      background: var(--warn-soft); color: var(--warn); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; }
    .actions-h, .actions-c { width: 240px; text-align: center; }
    table { width: 100%; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: var(--ink-mute); text-align: center; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.5; }
    .empty-state p { margin: 0; }
    .hidden { display: none; }
  `],
})
export class ResellersComponent implements OnInit, AfterViewInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  loading$: Observable<boolean> = this.store.select(selectResellersLoading);
  saving$: Observable<boolean> = this.store.select(selectResellersSaving);
  private resellers$: Observable<Reseller[]> = this.store.select(selectResellers);
  private sub?: RxSub;

  dataSource = new MatTableDataSource<Reseller>([]);
  cols = ['name', 'business', 'email', 'credits', 'status', 'actions'];
  search = '';
  skeletonRows = Array(6);

  // setters: la tabla vive tras *ngIf (loading), así que el ViewChild no existe
  // en ngAfterViewInit. El setter cablea sort/paginator cuando la tabla se renderiza.
  @ViewChild(MatSort) set matSort(s: MatSort) { if (s) this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }

  ngOnInit(): void {
    this.store.dispatch(ResellersActions.load());
    this.dataSource.filterPredicate = (r, filter) =>
      `${r.firstName} ${r.lastName} ${r.email} ${r.businessName ?? ''}`.toLowerCase().includes(filter);
    this.dataSource.sortingDataAccessor = (r, prop) => {
      switch (prop) {
        case 'name': return `${r.firstName} ${r.lastName}`.toLowerCase();
        case 'business': return (r.businessName ?? '').toLowerCase();
        case 'credits': return r.isOwner ? Number.MAX_SAFE_INTEGER : (r.credits ?? 0);
        case 'status': return r.active ? 1 : 0;
        default: return (r as any)[prop];
      }
    };
    this.sub = this.resellers$.subscribe((list) => (this.dataSource.data = list ?? []));
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

  goToCreditsDetail(reseller: Reseller): void {
    const id = reseller._id ?? reseller.id;
    if (id) this.router.navigate(['/dashboard/credits', id]);
  }

  openCreate(): void {
    const ref = this.dialog.open(ResellerFormDialogComponent, { data: { mode: 'create' } });
    ref.afterClosed().subscribe((result?: ResellerFormDialogResult) => {
      if (!result) return;
      this.store.dispatch(ResellersActions.create({ payload: result.payload as any }));
    });
  }

  openEdit(reseller: Reseller): void {
    const ref = this.dialog.open(ResellerFormDialogComponent, { data: { mode: 'edit', reseller } });
    ref.afterClosed().subscribe((result?: ResellerFormDialogResult) => {
      if (!result || !result.id) return;
      this.store.dispatch(ResellersActions.update({ id: result.id, payload: result.payload as any }));
    });
  }

  openTopup(reseller: Reseller): void {
    const ref = this.dialog.open(TopupDialogComponent, { data: { reseller } });
    ref.afterClosed().subscribe((result?: TopupDialogResult) => {
      if (!result) return;
      this.store.dispatch(ResellersActions.topup(result));
    });
  }

  openAdjust(reseller: Reseller): void {
    const ref = this.dialog.open(AdjustDialogComponent, { data: { reseller } });
    ref.afterClosed().subscribe((result?: AdjustDialogResult) => {
      if (!result) return;
      this.store.dispatch(ResellersActions.adjust(result));
    });
  }

  async confirmDelete(reseller: Reseller): Promise<void> {
    const name = `${reseller.firstName} ${reseller.lastName}`;
    const ok = await this.notify.confirmDelete(`el reseller ${name}`);
    if (!ok) return;
    const id = reseller._id ?? reseller.id ?? '';
    this.store.dispatch(ResellersActions.delete({ id }));
  }
}
