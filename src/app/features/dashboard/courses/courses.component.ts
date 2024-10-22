import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../../../core/services/courses.service';
import { Course } from './models';
import { MatDialog } from '@angular/material/dialog';
import { CoursesDialogComponent } from './course-dialog/courses-dialog.component';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent implements OnInit {
  isLoading = false;

  dataSource: Course[] = [];

  displayedColumns: string[] = ['id', 'name', 'duration', 'level', 'actions'];

  constructor(
    private coursesService: CoursesService,
    private matDialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.dataSource = courses;
        this.isLoading = false;
      },
    });
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
              this.handleUpdate(editCourse.id, res);
            } else {
              this.dataSource = [...this.dataSource, res];
            }
          }
        },
      });
  }

  handleUpdate(id: string, update: Course): void {
    this.isLoading = true;
    this.coursesService.updateCourseById(id, update).subscribe({
      next: (course) => {
        this.dataSource = course;
      },
      error: (err) => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
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
        this.isLoading = true;
        this.coursesService.removeCourseById(id).subscribe({
          next: (course) => {
            this.dataSource = course;
            Swal.fire('¡Eliminado!', 'El curso ha sido eliminado.', 'success');
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire(
              'Error',
              'Hubo un problema al eliminar el curso.',
              'error'
            );
          },
          complete: () => {
            this.isLoading = false;
          },
        });
      }
    });
  }
}
