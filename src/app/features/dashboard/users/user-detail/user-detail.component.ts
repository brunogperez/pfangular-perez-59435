import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../../core/services/users.service';
import { User } from '../models/index';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectorUserById } from '../store/user.selectors';
import { UserActions } from '../store/user.actions';

@Component({
  selector: 'app-user-detail',
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
