import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Course, ClassItem } from '../models';
import { Store } from '@ngrx/store';
import { selectorInscriptions } from '../../inscriptions/store/inscription.selectors';
import { combineLatest, map, Observable } from 'rxjs';
import { InscriptionActions } from '../../inscriptions/store/inscription.actions';
import { Inscription } from '../../inscriptions/models';
import { Student } from '../../students/models';
import { selectorStudents } from '../../students/store/student.selectors';
import { StudentActions } from '../../students/store/student.actions';
import Swal from 'sweetalert2';
import { CourseActions } from '../store/course.actions';
import {  selectCourseById } from '../store/course.selectors';


@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit {
  courseId: string;
  course$: Observable<Course>;
  classList: ClassItem[] = [];
  inscriptions$: Observable<Inscription[]>;
  inscriptionsByCourse$: Observable<Inscription[]>;
  studentsByCourse$: Observable<Student[]>;
  students$: Observable<Student[]>;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {
    this.courseId = this.activatedRoute.snapshot.params['id'];
    this.students$ = this.store.select(selectorStudents);
    this.course$ = this.store.select(selectCourseById);
    this.inscriptions$ = this.store.select(selectorInscriptions);
    this.inscriptionsByCourse$ = this.inscriptions$.pipe(
      map((inscriptions) =>
        inscriptions.filter(
          (inscription) => inscription.courseId === this.courseId
        )
      )
    );

    this.studentsByCourse$ = combineLatest([
      this.students$,
      this.inscriptionsByCourse$,
    ]).pipe(
      map(([students, inscriptionsByCourse]) => {
        const studentIds = inscriptionsByCourse.map((i) => i.studentId);
        return students.filter((student) => studentIds.includes(student.id));
      })
    );
  }
  ngOnInit(): void {
    this.store.dispatch(InscriptionActions.loadInscriptions());
    this.store.dispatch(StudentActions.loadStudents());
    this.store.dispatch(CourseActions.loadCourseById({ id: this.courseId }));
  }

  onDeleteInscription(studentId: string) {
    const courseRoute = this.courseId;
    if (courseRoute) {
      this.inscriptions$.subscribe((inscriptions) => {
        const filteredInscriptions = inscriptions.filter(
          (inscription) => inscription.studentId === studentId
        );
        if (filteredInscriptions.length > 0) {
          Swal.fire({
            title: '¿Estás seguro?',
            text: 'No podrás revertir esta acción',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.store.dispatch(
                InscriptionActions.deleteInscription({
                  id: filteredInscriptions[0].id,
                })
              );
            }
          });
        }
      });
    }
  }
}
