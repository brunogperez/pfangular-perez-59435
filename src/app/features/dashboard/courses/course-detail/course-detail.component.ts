import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Course, ClassItem } from '../models';
import { Store } from '@ngrx/store';
import { selectorInscriptions } from '../../inscriptions/store/inscription.selectors';
import { combineLatest, filter, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { InscriptionActions } from '../../inscriptions/store/inscription.actions';
import { Inscription } from '../../inscriptions/models';
import { Client } from '../../clients/models';
import { selectorClients } from '../../clients/store/client.selectors';
import { ClientActions } from '../../clients/store/client.actions';
import Swal from 'sweetalert2';
import { CourseActions } from '../store/course.actions';
import { selectCourseById } from '../store/course.selectors';


@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  courseId: string;
  course$!: Observable<Course | undefined>;
  classList: ClassItem[] = [];
  inscriptions$: Observable<Inscription[]>;
  inscriptionsByCourse$: Observable<Inscription[]>;
  clientsByCourse$: Observable<Client[]>;
  clients$: Observable<Client[]>;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) {
    this.courseId = this.activatedRoute.snapshot.params['id'];
    this.clients$ = this.store.select(selectorClients);
    this.inscriptions$ = this.store.select(selectorInscriptions);
    
    // Initialize inscriptionsByCourse$ after courseId is set
    this.inscriptionsByCourse$ = this.inscriptions$.pipe(
      map((inscriptions: Inscription[]) =>
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
        return clients.filter((client) => clientIds.includes(client._id));
      })
    );
  }
  ngOnInit(): void {
    // Load initial data
    this.store.dispatch(InscriptionActions.loadInscriptions());
    this.store.dispatch(ClientActions.loadClients({ page: 1, limit: 10 }));
    
    // Get course ID from route parameters
    this.courseId = this.activatedRoute.snapshot.params['id'];
    
    // Only load course if we have a valid ID
    if (this.courseId) {
      this.store.dispatch(CourseActions.loadCourseById({ id: this.courseId }));
      // Initialize course$ after dispatching the load action
      this.course$ = this.store.select(selectCourseById(this.courseId));
    } else {
      console.warn('No course ID found in route parameters');
    }
  }

  onDeleteInscription(clientId: string) {
    this.inscriptionsByCourse$.pipe(take(1)).subscribe((inscriptions: Inscription[]) => {
      const inscription = inscriptions.find(
        (i) => i.clientId === clientId && i.courseId === this.courseId
      );

      if (!inscription) return;

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
              id: inscription.id,
            })
          );
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
