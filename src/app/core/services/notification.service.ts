import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  showSuccess(message: string, title: string = 'Éxito'): void {
    Swal.fire(title, message, 'success');
  }

  showError(message: string, title: string = 'Error'): void {
    Swal.fire(title, message, 'error');
  }

  async confirmDelete(entityName: string): Promise<boolean> {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará ${entityName}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    return result.isConfirmed;
  }
}
