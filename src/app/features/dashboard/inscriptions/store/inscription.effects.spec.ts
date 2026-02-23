import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { InscriptionEffects } from './inscription.effects';
import { InscriptionActions } from './inscription.actions';
import { InscriptionService } from '../../../../core/services/inscriptions.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MockProvider } from 'ng-mocks';
import { Inscription } from '../models';
import { Action } from '@ngrx/store';

const mockInscription: Inscription = {
  id: 'i1',
  clientId: 'c1',
  productId: 'p1',
};

const mockInscriptions: Inscription[] = [mockInscription];

describe('InscriptionEffects', () => {
  let effects: InscriptionEffects;
  let actions$: Observable<Action>;
  let inscriptionService: InscriptionService;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InscriptionEffects,
        provideMockActions(() => actions$),
        MockProvider(InscriptionService, {
          getInscriptions: () => of(mockInscriptions),
          getInscriptionsByProduct: () => of(mockInscriptions),
          createInscription: () => of(mockInscription),
          deleteInscription: () => of(mockInscriptions),
        }),
        MockProvider(NotificationService, {
          showSuccess: () => {},
          showError: () => {},
        }),
      ],
    });

    effects = TestBed.inject(InscriptionEffects);
    inscriptionService = TestBed.inject(InscriptionService);
    notificationService = TestBed.inject(NotificationService);
  });

  it('loadInscriptions$ debe cargar inscripciones exitosamente', (done) => {
    actions$ = of(InscriptionActions.loadInscriptions());
    (effects.loadInscriptions$ as any).subscribe((action: Action) => {
      expect(action).toEqual(
        InscriptionActions.loadInscriptionsSuccess({ data: mockInscriptions })
      );
      done();
    });
  });

  it('loadInscriptions$ debe manejar error', (done) => {
    const error = new Error('Network error');
    spyOn(inscriptionService, 'getInscriptions').and.returnValue(
      throwError(() => error)
    );
    actions$ = of(InscriptionActions.loadInscriptions());
    (effects.loadInscriptions$ as any).subscribe((action: Action) => {
      expect(action).toEqual(
        InscriptionActions.loadInscriptionsFailure({ error })
      );
      done();
    });
  });

  it('loadInscriptionsByProduct$ debe cargar por producto', (done) => {
    actions$ = of(InscriptionActions.loadInscriptionsByProduct({ productId: 'p1' }));
    (effects.loadInscriptionsByProduct$ as any).subscribe((action: Action) => {
      expect(action).toEqual(
        InscriptionActions.loadInscriptionsByProductSuccess({ data: mockInscriptions })
      );
      done();
    });
  });

  it('createInscription$ debe crear inscripcion y mostrar notificación', (done) => {
    spyOn(notificationService, 'showSuccess');
    actions$ = of(InscriptionActions.createInscription({ productId: 'p1', clientId: 'c1' }));
    (effects.createInscription$ as any).subscribe((action: Action) => {
      expect(action).toEqual(
        InscriptionActions.createInscriptionSuccess({ data: mockInscription })
      );
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Inscripción creada exitosamente.'
      );
      done();
    });
  });

  it('createInscriptionSuccess$ debe disparar loadInscriptions', (done) => {
    actions$ = of(InscriptionActions.createInscriptionSuccess({ data: mockInscription }));
    (effects.createInscriptionSuccess$ as any).subscribe((action: Action) => {
      expect(action).toEqual(InscriptionActions.loadInscriptions());
      done();
    });
  });

  it('loadInscriptionsAfterDelete$ debe recargar despues de eliminar', (done) => {
    actions$ = of(InscriptionActions.deleteInscriptionSuccess({ data: mockInscriptions }));
    (effects.loadInscriptionsAfterDelete$ as any).subscribe((action: Action) => {
      expect(action).toEqual(InscriptionActions.loadInscriptions());
      done();
    });
  });
});
