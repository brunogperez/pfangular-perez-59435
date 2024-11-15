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
import { map, Observable } from 'rxjs';
import { selectorInscriptions } from '../../inscriptions/store/inscription.selectors';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
})
export class StudentDetailComponent implements OnInit {
  studentId?: string;
  student$?: Observable<Student>;
  inscriptions$?: Observable<Inscription[]>;
  inscriptionsByStudent$: Observable<Inscription[]>;
  isLoading = false;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {
    this.student$ = this.store
      .select(selectorStudents)
      .pipe(
        map(
          (students) =>
            students.find((student) => student.id === this.studentId)!
        )
      );

    this.store.select(selectCourse);
    this.studentId = this.activatedRoute.snapshot.params['id'];
    this.inscriptions$ = this.store.select(selectorInscriptions);
    this.inscriptionsByStudent$ = this.inscriptions$.pipe(
      map((inscriptions) =>
        inscriptions.filter(
          (inscription) => inscription.studentId === this.studentId
        )
      )
    );
  }
  ngOnInit(): void {
    this.store.dispatch(StudentActions.loadStudents());
    this.store.dispatch(CourseActions.loadCourses());
    this.store.dispatch(InscriptionActions.loadInscriptions());
  }

  onDeleteInscription(studentId: string) {
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
          InscriptionActions.deleteInscription({
            studentId: studentId,
          })
        );
        this.store.dispatch(InscriptionActions.loadInscriptions());
      }
    });
  }
}
