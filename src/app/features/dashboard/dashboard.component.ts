import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, Observable } from 'rxjs';
import { User, UserRole } from '../../core/models';
import { AuthActions } from '../../store/actions/auth.actions';
import { selectAuthUser } from '../../store/selectors/auth.selectors';
import { ThemeService } from '../../core/services/theme.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  /** Roles que ven este item. Si se omite, lo ven todos los autenticados. */
  roles?: UserRole[];
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'ADMIN',
  reseller: 'RESELLER',
  user: 'USER',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private router = inject(Router);
  private store = inject(Store);
  readonly theme = inject(ThemeService);

  authUser$: Observable<User | null> = this.store.select(selectAuthUser);
  isAdmin$: Observable<boolean> = this.authUser$.pipe(map((u) => u?.role === 'admin'));
  roleLabel$: Observable<string | null> = this.authUser$.pipe(
    map((u) => (u ? ROLE_LABELS[u.role] : null))
  );

  // Resellers/Planes/Créditos son admin-only (el backend los 403ea para reseller).
  private readonly allNavItems: NavItem[] = [
    { path: 'home', label: 'Inicio', icon: 'dashboard' },
    { path: 'resellers', label: 'Resellers', icon: 'storefront', roles: ['admin'] },
    { path: 'end-customers', label: 'Clientes finales', icon: 'people' },
    { path: 'plans', label: 'Planes', icon: 'inventory_2', roles: ['admin'] },
    { path: 'subscriptions', label: 'Suscripciones', icon: 'subscriptions' },
    { path: 'credits', label: 'Créditos', icon: 'account_balance_wallet', roles: ['admin'] },
  ];

  navItems$: Observable<NavItem[]> = this.authUser$.pipe(
    map((user) =>
      this.allNavItems.filter(
        (item) => !item.roles || (user != null && item.roles.includes(user.role))
      )
    )
  );

  currentRouteName = 'Inicio';

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const seg = event.url.split('/')[2] || 'home';
        const item = this.allNavItems.find((n) => n.path === seg);
        this.currentRouteName = item?.label || 'Ruta desconocida';
      });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
