import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ClientEffects } from './client.effects';
import { ClientActions } from './client.actions';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MockProvider } from 'ng-mocks';
import { Client } from '../models';
import { Action } from '@ngrx/store';

const mockClient: Client = {
  _id: 'c1',
  firstName: 'Juan',
  lastName: 'Perez',
  email: 'juan@mail.com',
  birthdate: new Date('1990-01-01'),
};

describe('ClientEffects', () => {
  let effects: ClientEffects;
  let actions$: Observable<Action>;
  let clientsService: ClientsService;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClientEffects,
        provideMockActions(() => actions$),
        MockProvider(ClientsService, {
          getClients: () => of([mockClient]),
          getClientById: () => of(mockClient),
          createClient: () => of(mockClient),
          updateClient: () => of(mockClient),
          deleteClient: () => of(undefined as any),
        }),
        MockProvider(NotificationService, {
          showSuccess: () => {},
          showError: () => {},
        }),
      ],
    });

    effects = TestBed.inject(ClientEffects);
    clientsService = TestBed.inject(ClientsService);
    notificationService = TestBed.inject(NotificationService);
  });

  it('loadClients$ debe cargar clientes exitosamente', (done) => {
    actions$ = of(ClientActions.loadClients());
    (effects.loadClients$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ClientActions.loadClientsSuccess({ clients: [mockClient] }));
      done();
    });
  });

  it('loadClients$ debe manejar error y mostrar notificación', (done) => {
    spyOn(clientsService, 'getClients').and.returnValue(
      throwError(() => new Error('Network error'))
    );
    spyOn(notificationService, 'showError');
    actions$ = of(ClientActions.loadClients());
    (effects.loadClients$ as any).subscribe((action: Action) => {
      expect(action).toEqual(
        ClientActions.loadClientsFailure({ error: 'Network error' })
      );
      expect(notificationService.showError).toHaveBeenCalledWith(
        'No se pudo cargar la lista de clientes.'
      );
      done();
    });
  });

  it('loadClientById$ debe cargar un cliente por id', (done) => {
    actions$ = of(ClientActions.loadClientById({ id: 'c1' }));
    (effects.loadClientById$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ClientActions.loadClientByIdSuccess({ client: mockClient }));
      done();
    });
  });

  it('createClient$ debe crear un cliente y mostrar notificación de éxito', (done) => {
    spyOn(notificationService, 'showSuccess');
    actions$ = of(ClientActions.createClient({ client: mockClient }));
    (effects.createClient$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ClientActions.createClientSuccess({ client: mockClient }));
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Cliente creado exitosamente.'
      );
      done();
    });
  });

  it('createClient$ debe manejar error y mostrar notificación', (done) => {
    spyOn(clientsService, 'createClient').and.returnValue(
      throwError(() => new Error('Create error'))
    );
    spyOn(notificationService, 'showError');
    actions$ = of(ClientActions.createClient({ client: mockClient }));
    (effects.createClient$ as any).subscribe((action: Action) => {
      expect(action).toEqual(
        ClientActions.createClientFailure({ error: 'Create error' })
      );
      expect(notificationService.showError).toHaveBeenCalledWith(
        'No se pudo crear el cliente.'
      );
      done();
    });
  });

  it('updateClient$ debe actualizar un cliente exitosamente', (done) => {
    spyOn(notificationService, 'showSuccess');
    actions$ = of(ClientActions.updateClient({ id: 'c1', update: { firstName: 'Updated' } }));
    (effects.updateClient$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ClientActions.updateClientSuccess({ client: mockClient }));
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'Cliente actualizado exitosamente.'
      );
      done();
    });
  });

  it('deleteClient$ debe eliminar un cliente y mostrar notificación', (done) => {
    spyOn(notificationService, 'showSuccess');
    actions$ = of(ClientActions.deleteClient({ id: 'c1' }));
    (effects.deleteClient$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ClientActions.deleteClientSuccess({ id: 'c1' }));
      expect(notificationService.showSuccess).toHaveBeenCalledWith(
        'El cliente ha sido eliminado correctamente.', '¡Eliminado!'
      );
      done();
    });
  });

  it('loadClientsAfterUpdate$ debe recargar clientes despues de crear', (done) => {
    actions$ = of(ClientActions.createClientSuccess({ client: mockClient }));
    (effects.loadClientsAfterUpdate$ as any).subscribe((action: Action) => {
      expect(action).toEqual(ClientActions.loadClients());
      done();
    });
  });
});
