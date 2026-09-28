import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { forkJoin, of, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../store/selectors/auth.selectors';
import { ResellersService } from '../../../core/services/resellers.service';
import { EndCustomersService } from '../../../core/services/end-customers.service';
import { SubscriptionsService } from '../../../core/services/subscriptions.service';
import { PlansService } from '../../../core/services/plans.service';
import {
  Reseller,
  Subscription,
  SubscriptionStats,
} from '../../../core/models';

interface DashboardCard {
  label: string;
  value: string | number;
  icon: string;
  route?: string;
}

interface ServiceRow {
  type: string;
  count: number;
  revenue: number;
  pct: number;
}

interface TopReseller {
  id: string;
  label: string;
  revenue: number;
  subsCount: number;
}

interface ExpiringRow {
  customer: string;
  plan: string;
  service: string;
  endDate: string;
  daysRemaining: number;
}

const LOW_CREDITS_THRESHOLD = 10;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private resellersService = inject(ResellersService);
  private endCustomersService = inject(EndCustomersService);
  private subscriptionsService = inject(SubscriptionsService);
  private plansService = inject(PlansService);
  private router = inject(Router);
  private store = inject(Store);

  cards: DashboardCard[] = [];
  stats: SubscriptionStats | null = null;
  serviceRows: ServiceRow[] = [];
  topResellers: TopReseller[] = [];
  expiringRows: ExpiringRow[] = [];
  lowCreditResellers: Reseller[] = [];
  threshold = LOW_CREDITS_THRESHOLD;
  loading = true;
  /** Widgets globales (top resellers, saldos críticos) solo aplican al admin. */
  isAdminView = true;

  ngOnInit(): void {
    this.store
      .select(selectAuthUser)
      .pipe(take(1))
      .subscribe((user) => {
        if (user?.role === 'reseller') {
          this.isAdminView = false;
          this.loadResellerHome(user.resellerProfile ?? null);
        } else {
          this.isAdminView = true;
          this.loadAdminHome();
        }
      });
  }

  private loadAdminHome(): void {
    forkJoin({
      resellers: this.resellersService.getAll(),
      customers: this.endCustomersService.getAll(),
      plans: this.plansService.getAll(),
      stats: this.subscriptionsService.getStats(),
      subs: this.subscriptionsService.getAll(),
    }).subscribe({
      next: ({ resellers, customers, plans, stats, subs }) => {
        this.stats = stats;
        this.cards = [
          { label: 'Resellers', value: resellers.length, icon: 'storefront', route: 'resellers' },
          { label: 'Clientes finales', value: customers.length, icon: 'people', route: 'end-customers' },
          { label: 'Planes activos', value: plans.filter((p) => p.active).length, icon: 'inventory_2', route: 'plans' },
          { label: 'Ingresos USD', value: `$${(stats.totalRevenue || 0).toFixed(2)}`, icon: 'attach_money' },
          { label: 'Vencen en 7 días', value: stats.expiringInNext7Days || 0, icon: 'schedule', route: 'subscriptions' },
        ];

        this.buildServiceRows(stats);
        this.buildTopResellers(subs);
        this.buildExpiringRows(subs);
        this.lowCreditResellers = resellers
          .filter((r) => !r.isOwner && r.credits < LOW_CREDITS_THRESHOLD)
          .sort((a, b) => a.credits - b.credits);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  /**
   * Home del reseller: solo endpoints que el backend devuelve scopeados (200).
   * Sin getStats()/resellers.getAll()/plans (admin-only → 403). Las métricas se
   * derivan client-side de SUS suscripciones.
   */
  private loadResellerHome(resellerId: string | null): void {
    forkJoin({
      customers: this.endCustomersService.getAll(),
      subs: this.subscriptionsService.getAll(),
      me: resellerId ? this.resellersService.getById(resellerId) : of(null),
    }).subscribe({
      next: ({ customers, subs, me }) => {
        const activeSubs = subs.filter((s) => s.status === 'active');
        const revenue = subs.reduce((sum, s) => sum + (s.salePrice ?? 0), 0);
        const expiringSoon = activeSubs.filter(
          (s) => s.daysRemaining !== undefined && s.daysRemaining <= 7
        ).length;

        this.cards = [
          { label: 'Mis clientes', value: customers.length, icon: 'people', route: 'end-customers' },
          { label: 'Suscripciones activas', value: activeSubs.length, icon: 'subscriptions', route: 'subscriptions' },
          { label: 'Mi saldo', value: me?.isOwner ? '∞' : `${me?.credits ?? 0} cr`, icon: 'account_balance_wallet' },
          { label: 'Ingresos generados', value: `$${revenue.toFixed(2)}`, icon: 'attach_money' },
          { label: 'Vencen en 7 días', value: expiringSoon, icon: 'schedule', route: 'subscriptions' },
        ];

        this.buildServiceRowsFromSubs(subs);
        this.buildExpiringRows(subs);
        this.topResellers = [];
        this.lowCreditResellers = [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  /** Ingresos por servicio derivados de las subs (sin stats.byServiceType). */
  private buildServiceRowsFromSubs(subs: Subscription[]): void {
    const map = new Map<string, ServiceRow>();
    for (const s of subs) {
      const type = s.planSnapshot?.serviceType ?? '—';
      const entry = map.get(type) ?? { type, count: 0, revenue: 0, pct: 0 };
      entry.count += 1;
      entry.revenue += s.salePrice ?? 0;
      map.set(type, entry);
    }
    const rows = Array.from(map.values());
    const max = rows.reduce((m, r) => Math.max(m, r.revenue), 0) || 1;
    this.serviceRows = rows
      .sort((a, b) => b.revenue - a.revenue)
      .map((r) => ({ ...r, pct: (r.revenue / max) * 100 }));
  }

  private buildServiceRows(stats: SubscriptionStats): void {
    const rows = (stats.byServiceType ?? []).map((r) => ({
      type: r._id,
      count: r.count,
      revenue: r.revenue,
    }));
    const max = rows.reduce((m, r) => Math.max(m, r.revenue), 0) || 1;
    this.serviceRows = rows
      .sort((a, b) => b.revenue - a.revenue)
      .map((r) => ({ ...r, pct: (r.revenue / max) * 100 }));
  }

  private buildTopResellers(subs: Subscription[]): void {
    const map = new Map<string, TopReseller>();
    for (const s of subs) {
      const r = s.soldBy as Partial<Reseller> | null | undefined;
      if (!r || typeof r === 'string') continue;
      const id = r._id ?? '';
      if (!id) continue;
      const label = r.isOwner
        ? 'Owner'
        : r.businessName || `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || 'Sin nombre';
      const entry = map.get(id) ?? { id, label, revenue: 0, subsCount: 0 };
      entry.revenue += s.salePrice ?? 0;
      entry.subsCount += 1;
      map.set(id, entry);
    }
    this.topResellers = Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private buildExpiringRows(subs: Subscription[]): void {
    this.expiringRows = subs
      .filter((s) => s.status === 'active' && s.daysRemaining !== undefined && s.daysRemaining <= 14)
      .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0))
      .slice(0, 8)
      .map((s) => {
        const c = s.endCustomer as any;
        const customer =
          typeof c === 'string' ? c : `${c?.firstName ?? ''} ${c?.lastName ?? ''}`.trim();
        return {
          customer,
          plan: s.planSnapshot.name,
          service: s.planSnapshot.serviceType,
          endDate: s.endDate,
          daysRemaining: s.daysRemaining ?? 0,
        };
      });
  }

  navigate(route?: string): void {
    if (route) this.router.navigate(['dashboard', route]);
  }

  goToReseller(id: string): void {
    this.router.navigate(['/dashboard/credits', id]);
  }
}
