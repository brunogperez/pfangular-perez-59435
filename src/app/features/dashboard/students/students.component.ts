import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StudentsDialogComponent } from './student-dialog/student-dialog.component';
import { Student } from './models';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../../../core/services/students.service';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectorStudents } from './store/student.selectors';
import { StudentActions } from './store/student.actions';
import { User } from '../users/models';
import { selectAuthUser } from '../../../store/selectors/auth.selectors';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss',
})
export class StudentsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'birthdate',
    'createdAt',
    'actions',
  ];
  user$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  students$: Observable<Student[]>;

  isLoading = false;
  constructor(
    private matDialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store
  ) {
    this.user$ = this.store.select(selectAuthUser);
    this.isAdmin$ = this.user$.pipe(map((user) => user?.role === 'user'));
    this.students$ = this.store.select(selectorStudents);
    
  }

  ngOnInit(): void {
    this.store.dispatch(StudentActions.loadStudents());
    this.isLoading = false;
    
  }

  goToDetail(id: string): void {
    this.router.navigate([id, 'detail'], { relativeTo: this.activatedRoute });
  }

  openDialog(editStudent?: Student): void {
    this.matDialog
      .open(StudentsDialogComponent, { data: { editStudent } })
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (!!res) {
            if (editStudent) {
              this.store.dispatch(
                StudentActions.updateStudent({
                  id: editStudent.id,
                  update: res,
                })
              );
            } else {
              this.store.dispatch(
                StudentActions.createStudent({ student: res })
              );
            }
          }
        },
      });
  }

  onDelete(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.store.dispatch(StudentActions.deleteStudent({ id }));
      }
    });
  }
}
