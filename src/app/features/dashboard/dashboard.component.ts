import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter, map, Observable } from 'rxjs';
import { User } from './users/models';

@Component({
  selector: 'app-dashboard',
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
    '/students': 'Alumnos',
    '/courses': 'Cursos',
    '/inscriptions': 'Inscripciones',
  };

  constructor(private router: Router, private authService: AuthService) {
    this.authUser$ = this.authService.authUser$;

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
    this.authService.logout();
  }
}
