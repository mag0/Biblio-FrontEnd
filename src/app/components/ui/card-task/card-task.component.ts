import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ConfirmationPopupComponent } from '../../confirmation-popup/confirmation-popup.component';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-card-task',
  imports: [CommonModule, RouterLink, ConfirmationPopupComponent],
  templateUrl: './card-task.component.html',
  styleUrl: './card-task.component.css'
})
export class CardTaskComponent {
  @Input() task: any;
  @Input() isBibliotecario: boolean = false;
  @Input() isAlumno: boolean = false;
  @Input() onLoadTasks: () => void = () => {};
    // Propiedades para el popup de confirmación
    showConfirmationPopup: boolean = false;
    popupTitle: string = '';
    popupQuestion: string = '';
    taskToDeleteId: number | null = null;
    taskToDeleteIndex: number | null = null;

  constructor(private router: Router,
    private orderService: OrderService,
  ) {  }



  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'status-pendiente task-status-badge';
      case 'en proceso': return 'status-en-proceso task-status-badge';
      case 'en revisión': return 'status-en-revision task-status-badge';
      case 'denegada': return 'status-denegado task-status-badge';
      case 'completada': return 'status-completado task-status-badge';
      default: return 'status-pendiente task-status-badge';
    }
  }

  askForDeleteConfirmation(taskId: number, taskName: string, event: Event): void {
    event.stopPropagation();
    this.taskToDeleteId = taskId;
    this.popupTitle = 'Confirmar Eliminación';
    this.popupQuestion = `¿Estás seguro de que quieres eliminar la tarea "${taskName}"?`;
    this.showConfirmationPopup = true;
  }

  deleteTask(taskId: number, taskName: string, event: Event): void {
    console.log('Eliminar tarea:', taskId, taskName);
    this.askForDeleteConfirmation(taskId, taskName, event);
  }

  navigateToEdit(taskId: number, event: Event): void {
    event.stopPropagation(); 
    this.router.navigate(['/form-task', taskId]);
  }

  async confirmDelete(){
    if (this.taskToDeleteId !== null) {
      await this.orderService.deleteOrder(this.taskToDeleteId).subscribe({
        next: async () => {
          this.resetDeleteState();
          await this.onLoadTasks();
        },
        error: error => {
          console.error('Error al eliminar la tarea:', error);
          alert('No se pudo eliminar la tarea.');
          this.resetDeleteState();
        }
      });
    } else {
      console.error('Error: IDs para eliminar no encontrados.');
      this.resetDeleteState();
    }
  }

  private resetDeleteState(): void {
    this.showConfirmationPopup = false;
    this.taskToDeleteId = null;
    this.taskToDeleteIndex = null;
    this.popupTitle = '';
    this.popupQuestion = '';
  }

  cancelDelete(): void {
    this.resetDeleteState();
    this.onLoadTasks();
  }
}
