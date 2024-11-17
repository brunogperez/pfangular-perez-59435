import { Component, OnInit } from '@angular/core';
import { Course } from './models';
import { MatDialog } from '@angular/material/dialog';
import { CoursesDialogComponent } from './course-dialog/courses-dialog.component';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCourse } from './store/course.selectors';
import { CourseActions } from './store/course.actions';
import { InscriptionActions } from '../inscriptions/store/inscription.actions';
import { Inscription } from '../inscriptions/models';
import { selectorInscriptions } from '../inscriptions/store/inscription.selectors';
import { User } from '../users/models';
import { selectAuthUser } from '../../../store/selectors/auth.selectors';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'duration', 'level', 'actions'];

  isLoading = false;
  user$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  inscriptions$: Observable<Inscription[]>;
  courses$: Observable<Course[]>;

  constructor(
    private store: Store,
    private matDialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.user$ = this.store.select(selectAuthUser);
    this.isAdmin$ = this.user$.pipe(map((user) => user?.role === 'admin'));
    this.inscriptions$ = this.store.select(selectorInscriptions);
    this.courses$ = this.store.select(selectCourse);
  }

  ngOnInit(): void {
    this.store.dispatch(CourseActions.loadCourses());
    this.store.dispatch(InscriptionActions.loadInscriptions());
  }

  goToDetail(id: string): void {
    this.router.navigate([id, 'detail'], { relativeTo: this.activatedRoute });
  }

  openModal(editCourse?: Course): void {
    this.matDialog
      .open(CoursesDialogComponent, { data: { editCourse } })
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (!!res) {
            if (editCourse) {
              this.store.dispatch(
                CourseActions.updateCourse({ id: editCourse.id, update: res })
              );
            } else {
              this.store.dispatch(CourseActions.createCourse({ course: res }));
            }
          }
        },
      });
  }

  onDeleteCourse(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(CourseActions.deleteCourse({ id }));
      }
    });
  }
}
