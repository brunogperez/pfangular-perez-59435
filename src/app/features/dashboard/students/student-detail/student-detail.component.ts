import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Student } from '../models';
import { Inscription } from '../../inscriptions/models';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { InscriptionActions } from '../../inscriptions/store/inscription.actions';
import { selectorStudents } from '../store/student.selectors';
import { StudentActions } from '../store/student.actions';
import { selectCourse } from '../../courses/store/course.selectors';
import { CourseActions } from '../../courses/store/course.actions';
import { combineLatest, map, Observable, filter } from 'rxjs';
import { selectorInscriptions } from '../../inscriptions/store/inscription.selectors';
import { Course } from '../../courses/models';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
})
export class StudentDetailComponent implements OnInit {
  courseId: string;
  studentId?: string;
  courses$?: Observable<Course[]>;
  student$?: Observable<Student>;
  inscriptions$?: Observable<Inscription[]>;
  inscriptionsByStudent$: Observable<Inscription[]>;
  coursesByStudent$?: Observable<Course[]>;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {
    this.courseId = this.activatedRoute.snapshot.params['id'];
    this.studentId = this.activatedRoute.snapshot.params['id'];
    this.inscriptions$ = this.store.select(selectorInscriptions);
    this.inscriptionsByStudent$ = this.inscriptions$.pipe(
      map((inscriptions) =>
        inscriptions.filter(
          (inscription) => inscription.studentId === this.studentId
        )
      )
    );
    this.student$ = this.store
      .select(selectorStudents)
      .pipe(
        map(
          (students) =>
            students.find((student) => student.id === this.studentId)!
        )
      );

    this.courses$ = this.store.select(selectCourse);

    this.coursesByStudent$ = combineLatest([
      this.courses$,
      this.inscriptionsByStudent$,
    ]).pipe(
      map(([courses, inscriptionsByStudent]) => {
        const inscriptions = inscriptionsByStudent.map((i) => i.courseId);

        return courses.filter((course) => inscriptions.includes(course.id));
      })
    );
  }
  ngOnInit(): void {
    this.store.dispatch(StudentActions.loadStudents());
    this.store.dispatch(CourseActions.loadCourses());
    this.store.dispatch(InscriptionActions.loadInscriptions());
  }

  onDeleteInscription(id: string) {
    const courseRoute = this.courseId;
    if (courseRoute) {
      this.store.select(selectorInscriptions).subscribe((inscriptions) => {
        const filteredInscriptions = inscriptions.filter(
          (inscription) => inscription.courseId === id
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
