import { Component, OnInit } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { CoursesService } from '../../../core/services/courses.service';
import { Course } from '../courses/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InscriptionService } from '../../../core/services/inscriptions.service';
import { Inscription } from './models';
import { Student } from '../students/models';
import { StudentsService } from '../../../core/services/students.service';

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

  searchTerm$ = new Subject<string>();
  inscription$: Observable<Inscription[]>;
  courses$: Observable<Course[]>;
  students$!: Observable<Student[]>;
  inscriptionForm: FormGroup;

  constructor(
    private inscriptionService: InscriptionService,
    private coursesService: CoursesService,
    private formBuilder: FormBuilder,
    private studentService: StudentsService
  ) {
    this.inscription$ = this.inscriptionService.getInscriptions();
    this.courses$ = this.coursesService.getCourses();

    this.inscriptionForm = this.formBuilder.group({
      studentId: [null, Validators.required],
      courseId: [null, Validators.required],
    });

    this.students$ = this.searchTerm$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((term: string) => this.inscriptionService.searchStudents(term))
    );
  }

  ngOnInit(): void {
    this.students$ = this.searchTerm$.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((term: string) =>
        term
          ? this.inscriptionService.searchStudents(term)
          : this.studentService.getStudents()
      )
    );
  }

  onSubmit(): void {
    if (this.inscriptionForm.invalid) {
      this.inscriptionForm.markAllAsTouched();
    } else {
      this.inscriptionService
        .createInscription(this.inscriptionForm.value)
        .subscribe({
          next: () => this.inscriptionService.getInscriptions(),
        });
    }
  }

  search(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    this.searchTerm$.next(element.value);
  }
}
