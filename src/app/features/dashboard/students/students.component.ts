import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StudentsDialogComponent } from './student-dialog/student-dialog.component';
import { Student } from './models';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../../../core/services/students.service';

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

  dataSource: Student[] = [];

  isLoading = false;

  constructor(
    private matDialog: MatDialog,
    private studentsService: StudentsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentsService.getStudents().subscribe({
      next: (students) => {
        this.dataSource = students;
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
        this.studentsService.removeStudentById(id).subscribe({
          next: (students) => {
            this.dataSource = students;
            Swal.fire('¡Eliminado!', 'El alumno ha sido eliminado.', 'success');
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire(
              'Error',
              'Hubo un problema al eliminar el alumno.',
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
              this.handleUpdate(editStudent.id, res);
            } else {
              this.studentsService.createStudent(res).subscribe({
                next: () => this.loadStudents(),
              });
            }
          }
        },
      });
  }

  handleUpdate(id: string, update: Student): void {
    this.isLoading = true;
    this.studentsService.updateStudentById(id, update).subscribe({
      next: (students) => {
        this.dataSource = students;
      },
      error: (err) => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
