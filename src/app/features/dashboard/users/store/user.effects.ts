import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  map,
  mergeMap,
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { UserActions } from './user.actions';
import { Action } from '@ngrx/store';
import { UsersService } from '../../../../core/services/users.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Injectable()
export class UserEffects {
  loadUsers$: Actions<Action<string>>;
  loadUserById$: Actions<Action<string>>;
  loadUsersAfterUpdate$: Actions<Action<string>>;
  deleteUsers$: Actions<Action<string>>;
  updateUsers$: Actions<Action<string>>;
  createUsers$: Actions<Action<string>>;

  constructor(
    private actions$: Actions,
    private usersService: UsersService,
    private notificationService: NotificationService,
  ) {
    this.loadUsers$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(UserActions.loadUsers),
        concatMap(() =>
          this.usersService.getUsers().pipe(
            map((res) => UserActions.loadUsersSuccess({ data: res })),
            catchError((error) => of(UserActions.loadUsersFailure({ error })))
          )
        )
      );
    });

    this.loadUserById$ = createEffect(() =>
      this.actions$.pipe(
        ofType(UserActions.loadUserById),
        mergeMap(({ id }) =>
          this.usersService.getUserById(id).pipe(
            map((user) => UserActions.loadUserByIdSuccess({  data: user })),
            catchError((error) =>
              of(UserActions.loadUserByIdFailure({ error }))
            )
          )
        )
      )
    );

    this.loadUsersAfterUpdate$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(
          UserActions.createUserSuccess,
          UserActions.updateUserSuccess,
          UserActions.deleteUserSuccess
        ),
        map(() => UserActions.loadUsers())
      );
    });

    this.createUsers$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(UserActions.createUser),
        mergeMap(({ user }) =>
          this.usersService.createUser(user).pipe(
            map((newUser) => {
              this.notificationService.showSuccess('Usuario creado exitosamente.');
              return UserActions.createUserSuccess({ user: newUser });
            }),
            catchError((error) => {
              this.notificationService.showError('No se pudo crear el usuario.');
              return of(UserActions.createUserFailure({ error }));
            })
          )
        )
      );
    });

    this.updateUsers$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(UserActions.updateUser),
        distinctUntilChanged(),
        mergeMap(({ id, update }) =>
          this.usersService.updateUserById(id, update).pipe(
            map((user) => {
              const updatedUser = user[0];
              this.notificationService.showSuccess('Usuario actualizado exitosamente.');
              return UserActions.updateUserSuccess({
                user: updatedUser,
              });
            }),
            catchError((error) => {
              this.notificationService.showError('No se pudo actualizar el usuario.');
              return of(UserActions.updateUserFailure({ error }));
            })
          )
        )
      );
    });

    this.deleteUsers$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(UserActions.deleteUser),
        switchMap(({ id }) =>
          this.usersService.removeUserById(id).pipe(
            map((res) => {
              this.notificationService.showSuccess('El usuario ha sido eliminado.', '¡Eliminado!');
              return UserActions.deleteUserSuccess({ data: res });
            }),
            catchError((error) => {
              this.notificationService.showError('Hubo un problema al eliminar el usuario.');
              return of(UserActions.deleteUserFailure({ error }));
            })
          )
        )
      );
    });
  }
}
