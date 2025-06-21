import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Course, ClassItem } from '../models';
import { Store } from '@ngrx/store';
import { selectorInscriptions } from '../../inscriptions/store/inscription.selectors';
import { combineLatest, map, Observable } from 'rxjs';
import { InscriptionActions } from '../../inscriptions/store/inscription.actions';
import { Inscription } from '../../inscriptions/models';
import { Client } from '../../clients/models';
import { selectorClients } from '../../clients/store/client.selectors';
import { ClientActions } from '../../clients/store/client.actions';
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
  clientsByCourse$: Observable<Client[]>;
  clients$: Observable<Client[]>;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {
    this.courseId = this.activatedRoute.snapshot.params['id'];
    this.clients$ = this.store.select(selectorClients);
    this.course$ = this.store.select(selectCourseById);
    this.inscriptions$ = this.store.select(selectorInscriptions);
    this.inscriptionsByCourse$ = this.inscriptions$.pipe(
      map((inscriptions) =>
        inscriptions.filter(
          (inscription) => inscription.courseId === this.courseId
        )
      )
    );

    this.clientsByCourse$ = combineLatest([
      this.clients$,
      this.inscriptionsByCourse$,
    ]).pipe(
      map(([clients, inscriptionsByCourse]) => {
        const clientIds = inscriptionsByCourse.map((i) => i.clientId);
        return clients.filter((client) => clientIds.includes(client.id));
      })
    );
  }
  ngOnInit(): void {
    this.store.dispatch(InscriptionActions.loadInscriptions());
    this.store.dispatch(ClientActions.loadClients());
    this.store.dispatch(CourseActions.loadCourseById({ id: this.courseId }));
  }

  onDeleteInscription(clientId: string) {
    const courseRoute = this.courseId;
    if (courseRoute) {
      this.inscriptions$.subscribe((inscriptions) => {
        const filteredInscriptions = inscriptions.filter(
          (inscription) => inscription.clientId === clientId
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
