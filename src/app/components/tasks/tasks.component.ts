import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { RouterLink, Router } from '@angular/router';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { OrderManagmentService } from '../../services/orderManagment.service';

declare var M: any;

@Component({
  standalone: true,
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  imports: [CommonModule, RouterLink, ConfirmationPopupComponent, FormsModule]
})
export class TasksComponent implements OnInit {
  tasks: any[] = [];
  isLoading: boolean = true;
  selectedEstado: string = '';

  // Propiedades para el popup de confirmación
  showConfirmationPopup: boolean = false;
  popupTitle: string = '';
  popupQuestion: string = '';
  taskToDeleteId: number | null = null;
  taskToDeleteIndex: number | null = null;

  isRol: string = '';
  isBibliotecario: boolean = false;
  isAlumno: boolean = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private orderManagmentService: OrderManagmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.isBibliotecario = this.authService.hasRole('Bibliotecario') || this.authService.hasRole('Admin');
    this.isAlumno = this.authService.hasRole('Alumno');
  }

  loadTasks(): void {
    this.isLoading = true;
  
    const request = this.selectedEstado 
      ? this.orderManagmentService.getOrdersByState(this.selectedEstado) 
      : this.orderService.getOrders();
  
    request.subscribe({
      next: (data: any[]) => {
        let filteredTasks = data;
  
        if (this.authService.hasRole('Voluntario')) {
          filteredTasks = filteredTasks.filter(task => task.estado.toLowerCase() === 'pendiente');
        } else if (this.authService.hasRole('Voluntario Administrativo')) {
          filteredTasks = filteredTasks.filter(task => task.estado.toLowerCase() !== 'completada');
        } else if (this.authService.hasRole('Alumno')) {
          filteredTasks = filteredTasks.filter(task => task.estado.toLowerCase() === 'completada');
        }
  
        this.tasks = filteredTasks;
        this.isLoading = false;
        setTimeout(() => this.initializeCollapsible(), 0);
      },
      error: error => {
        console.error('Error al obtener las tareas:', error);
        this.isLoading = false;
      }
    });
  }

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

  initializeCollapsible(): void {
    try {
      const elems = document.querySelectorAll('.collapsible');
      if (elems && elems.length > 0) {
        M.Collapsible.init(elems, { accordion: false });
      }
    } catch (e) {
      console.error('Error inicializando Materialize Collapsible:', e);
    }
  }

  // Método para solicitar confirmación antes de eliminar
  askForDeleteConfirmation(taskId: number, index: number, taskName: string, event: Event): void {
    event.stopPropagation();
    this.taskToDeleteId = taskId;
    this.taskToDeleteIndex = index;
    this.popupTitle = 'Confirmar Eliminación';
    this.popupQuestion = `¿Estás seguro de que quieres eliminar la tarea "${taskName}"?`;
    this.showConfirmationPopup = true;
  }

  // Método que se ejecuta al confirmar la eliminación desde el popup
  confirmDelete(): void {
    if (this.taskToDeleteId !== null && this.taskToDeleteIndex !== null) {
      this.orderService.deleteOrder(this.taskToDeleteId).subscribe({
        next: () => {
          this.loadTasks(); 
          this.resetDeleteState();
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

  // Método que se ejecuta al cancelar la eliminación desde el popup
  cancelDelete(): void {
    this.resetDeleteState();
    this.loadTasks();
  }

  // Resetea el estado del popup
  private resetDeleteState(): void {
    this.showConfirmationPopup = false;
    this.taskToDeleteId = null;
    this.taskToDeleteIndex = null;
    this.popupTitle = '';
    this.popupQuestion = '';
  }

  deleteTask(taskId: number, index: number, taskName: string, event: Event): void {
    this.askForDeleteConfirmation(taskId, index, taskName, event);
  }

  navigateToEdit(taskId: number, event: Event): void {
    event.stopPropagation(); 
    this.router.navigate(['/form-task', taskId]);
  }
}