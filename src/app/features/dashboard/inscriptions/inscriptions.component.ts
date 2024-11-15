import { Component, OnInit } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { CoursesService } from '../../../core/services/courses.service';
import { InscriptionService } from '../../../core/services/inscriptions.service';
import { Inscription } from './models';
import { Student } from '../students/models';
import { StudentsService } from '../../../core/services/students.service';
import { MatDialog } from '@angular/material/dialog';
import { InscriptionDialogComponent } from './inscription-dialog/inscription-dialog.component';
import { Store } from '@ngrx/store';
import { InscriptionActions } from './store/inscription.actions';
import {
  selectorInscriptionError,
  selectorInscriptions,
  selectorIsLoadingInscriptions,
} from './store/inscription.selectors';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inscriptions',
  templateUrl: './inscriptions.component.html',
  styleUrl: './inscriptions.component.scss',
})
export class InscriptionsComponent implements OnInit {
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

  searchTerm$ = new Subject<string>();

  students$!: Observable<Student[]>;

  isncriptions$: Observable<Inscription[]>;

  loadInscriptionError$: Observable<Error | null | HttpErrorResponse>;
  isLoadingInscriptions$: Observable<boolean>;

  constructor(
    private inscriptionService: InscriptionService,

    private studentService: StudentsService,
    private matDialog: MatDialog,
    private store: Store
  ) {
    this.isncriptions$ = this.store.select(selectorInscriptions);
    this.loadInscriptionError$ = this.store.select(selectorInscriptionError);
    this.isLoadingInscriptions$ = this.store.select(
      selectorIsLoadingInscriptions
    );
  }

  ngOnInit(): void {
    this.store.dispatch(InscriptionActions.loadInscriptions());

    this.searchTerm$
      .pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((term: string) =>
          term
            ? this.inscriptionService.searchStudents(term)
            : this.studentService.getStudents()
        )
      )
      .subscribe({
        next: (students) => {
          this.dataSource = students;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  search(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    this.searchTerm$.next(element.value);
  }

  openDialog(inscription?: Inscription): void {
    this.matDialog.open(InscriptionDialogComponent, { data: { inscription } });
  }

  onDelete(studentId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.store.dispatch(
          InscriptionActions.deleteInscription({ studentId })
        );
      }
    });
  }
}
