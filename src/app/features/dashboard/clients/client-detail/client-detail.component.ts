import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Client } from '../models';
import { Inscription } from '../../inscriptions/models';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { InscriptionActions } from '../../inscriptions/store/inscription.actions';
import { selectorClients } from '../store/client.selectors';
import { ClientActions } from '../store/client.actions';
import { selectCourse } from '../../courses/store/course.selectors';
import { CourseActions } from '../../courses/store/course.actions';
import { combineLatest, map, Observable, filter } from 'rxjs';
import { selectorInscriptions } from '../../inscriptions/store/inscription.selectors';
import { Course } from '../../courses/models';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
})
export class ClientDetailComponent implements OnInit {
  courseId: string;
  clientId?: string;
  courses$?: Observable<Course[]>;
  client$?: Observable<Client>;
  inscriptions$?: Observable<Inscription[]>;
  inscriptionsByClient$: Observable<Inscription[]>;
  coursesByClient$?: Observable<Course[]>;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {
    this.courseId = this.activatedRoute.snapshot.params['id'];
    this.clientId = this.activatedRoute.snapshot.params['id'];
    this.inscriptions$ = this.store.select(selectorInscriptions);
    this.inscriptionsByClient$ = this.inscriptions$.pipe(
      map((inscriptions) =>
        inscriptions.filter(
          (inscription) => inscription.clientId === this.clientId
        )
      )
    );
    this.client$ = this.store
      .select(selectorClients)
      .pipe(
        map(
          (clients) =>
            clients.find((client) => client.id === this.clientId)!
        )
      );

    this.courses$ = this.store.select(selectCourse);

    this.coursesByClient$ = combineLatest([
      this.courses$,
      this.inscriptionsByClient$,
    ]).pipe(
      map(([courses, inscriptionsByClient]) => {
        const inscriptions = inscriptionsByClient.map((i) => i.courseId);

        return courses.filter((course) => inscriptions.includes(course.id));
      })
    );
  }
  ngOnInit(): void {
    this.store.dispatch(ClientActions.loadClients());
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
