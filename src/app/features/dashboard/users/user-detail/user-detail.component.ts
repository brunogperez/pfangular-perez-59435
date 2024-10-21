import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../../core/services/users.service';
import { User } from '../models/index';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  idUser?: string;
  user?: User;
  isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private usersService: UsersService
  ) {}
  ngOnInit(): void {
    this.isLoading = true;
    this.usersService
      .getUserById(this.activatedRoute.snapshot.params['id'])
      .subscribe({
        next: (user) => {
          this.user = user;
          this.isLoading = false;
        },
      });
  }
}
