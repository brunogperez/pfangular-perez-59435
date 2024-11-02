import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { map, Observable } from 'rxjs';
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

  constructor(private router: Router, private authService: AuthService) {
    this.authUser$ = this.authService.authUser$;

    this.isAdmin$ = this.authUser$.pipe(map((user) => user?.role === 'admin'));
  }

  logout(): void {
    this.authService.logout();
  }
}
