import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, Observable } from 'rxjs';
import { User } from './users/models';
import { AuthActions } from '../../store/actions/auth.actions';
import { selectAuthUser } from '../../store/selectors/auth.selectors';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  showFiller = false;

  authUser$: Observable<User | null>;

  isAdmin$: Observable<boolean>;

  currentRouteName: string = '';
  routeNames: { [key: string]: string } = {
    '/home': 'Inicio',
    '/users': 'Usuarios',
    '/clients': 'Clientes',
    '/products': 'Productos',
    '/inscriptions': 'Inscripciones',
  };

  constructor(private router: Router, private store: Store) {
    this.authUser$ = this.store.select(selectAuthUser);

    this.isAdmin$ = this.authUser$.pipe(map((user) => user?.role === 'admin'));

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const baseRoute = event.url.split('/')[2];
        const routePath = `/${baseRoute}`;
        this.currentRouteName =
          this.routeNames[routePath] || 'Ruta desconocida';
      });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
