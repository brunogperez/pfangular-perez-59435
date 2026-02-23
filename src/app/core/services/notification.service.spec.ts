import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import Swal from 'sweetalert2';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    spyOn(Swal, 'fire');
  });

  it('debe ser definido', () => {
    expect(service).toBeTruthy();
  });

  it('showSuccess debe llamar a Swal.fire con icono success', () => {
    service.showSuccess('Operación exitosa');
    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Operación exitosa', 'success');
  });

  it('showSuccess debe aceptar un título personalizado', () => {
    service.showSuccess('Eliminado correctamente', '¡Eliminado!');
    expect(Swal.fire).toHaveBeenCalledWith('¡Eliminado!', 'Eliminado correctamente', 'success');
  });

  it('showError debe llamar a Swal.fire con icono error', () => {
    service.showError('Algo salió mal');
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Algo salió mal', 'error');
  });

  it('showError debe aceptar un título personalizado', () => {
    service.showError('Conexión perdida', 'Error de red');
    expect(Swal.fire).toHaveBeenCalledWith('Error de red', 'Conexión perdida', 'error');
  });
});
