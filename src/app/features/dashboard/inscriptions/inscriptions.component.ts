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
import { Course } from '../courses/models';
import { InscriptionService } from '../../../core/services/inscriptions.service';
import { Inscription } from './models';
import { Student } from '../students/models';
import { StudentsService } from '../../../core/services/students.service';
import { MatDialog } from '@angular/material/dialog';
import { InscriptionDialogComponent } from './inscription-dialog/inscription-dialog.component';
import { Store } from '@ngrx/store';
import { InscriptionActions } from './store/inscription.actions';
import {
  selectorCourseOptions,
  selectorInscriptions,
  selectorStudentOptions,
} from './store/inscription.selectors';

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
  inscription$: Observable<Inscription[]>;
  courses$: Observable<Course[]>;
  students$!: Observable<Student[]>;

  isncriptionsStore$: Observable<Inscription[]>;
  coursesStore$: Observable<Course[]>;
  studentsStore$!: Observable<Student[]>;
  constructor(
    private inscriptionService: InscriptionService,
    private coursesService: CoursesService,
    private studentService: StudentsService,
    private matDialog: MatDialog,
    private store: Store
  ) {
    this.isncriptionsStore$ = this.store.select(selectorInscriptions);
    this.coursesStore$ = this.store.select(selectorCourseOptions);
    this.studentsStore$ = this.store.select(selectorStudentOptions);

    this.inscription$ = this.inscriptionService.getInscriptions();
    this.courses$ = this.coursesService.getCourses();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.store.dispatch(InscriptionActions.loadInscriptions());
    this.store.dispatch(InscriptionActions.loadCourseOptions());
    this.store.dispatch(InscriptionActions.loadStrudentOptions());
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
    this.matDialog
      .open(InscriptionDialogComponent, { data: { inscription } })
      .afterClosed()
      .subscribe({
        next: (res) => this.inscriptionService.createInscription(res),
      });
  }
}
