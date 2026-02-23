import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../../core/services/users.service';
import { User } from '../models/index';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectorUserById } from '../store/user.selectors';
import { UserActions } from '../store/user.actions';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserFullNamePipe } from '../../../../shared/pipes/user-full-name.pipe';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatCardModule,
    MatIconModule,
    UserFullNamePipe,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  userId$: string;
  user$: Observable<User>;
  isLoading = false;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {
    this.user$ = this.store.select(selectorUserById);
    this.userId$ = this.activatedRoute.snapshot.params['id'];
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.store.dispatch(UserActions.loadUserById({ id: this.userId$ }));
  }
}
