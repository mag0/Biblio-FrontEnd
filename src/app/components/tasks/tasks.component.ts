import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { RouterLink, Router } from '@angular/router'; // Add Router import
import { saveAs } from 'file-saver';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';
import { AuthService } from '../../services/auth.service';

declare var M: any;

@Component({
  standalone: true,
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  imports: [CommonModule, RouterLink, ConfirmationPopupComponent]
})
export class TasksComponent implements OnInit {
  tasks: any[] = [];
  isLoading: boolean = true;

  // Propiedades para el popup de confirmación
  showConfirmationPopup: boolean = false;
  popupTitle: string = '';
  popupQuestion: string = '';
  taskToDeleteId: number | null = null;
  taskToDeleteIndex: number | null = null;

  isLibrarian: boolean = false; // Añadir esta propiedad

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router // Add Router injection
  ) {}

  ngOnInit(): void {
    console.log('TasksComponent - Iniciando componente');
    this.loadTasks();
    // Subscribe to user information before checking role
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('Usuario cargado:', user);
        this.checkUserRole();
        console.log('TasksComponent - Rol verificado');
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
      }
    });
  }

  private checkUserRole(): void {
    console.log('checkUserRole - Verificando rol del usuario');
    const userRole = this.authService.getCurrentUserRole();
    console.log('checkUserRole - Rol obtenido:', userRole);
    this.isLibrarian = userRole === 'Admin';
    console.log('checkUserRole - ¿Es bibliotecario?:', this.isLibrarian);
  }

  loadTasks(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (data: any[]) => {
        this.tasks = data.map(task => ({
          ...task,
          fileName: task.filePath ? task.filePath.split(/[\\/]/).pop() : null
          // Ya no necesitamos isExpanded
        }));
        console.log('Tareas obtenidas:', this.tasks);
        this.isLoading = false;
        // Es crucial reinicializar collapsible DESPUÉS de que Angular actualice el DOM
        setTimeout(() => this.initializeCollapsible(), 0);
      },
      error: error => {
        console.error('Error al obtener las tareas:', error);
        this.isLoading = false;
      }
    });
  }

  initializeCollapsible(): void {
    try {
      const elems = document.querySelectorAll('.collapsible');
      if (elems && elems.length > 0) {
        M.Collapsible.init(elems, { accordion: false }); // Usar accordion: false para popout
        console.log('Collapsible inicializado.');
      } else {
        // Puede que no haya tareas, así que no es un error necesariamente
        console.log('No se encontraron elementos .collapsible para inicializar (puede que no haya tareas).');
      }
    } catch (e) {
      console.error('Error inicializando Materialize Collapsible:', e);
    }
  }

  // Método para descargar el archivo (se mantiene igual, pero revisa event.stopPropagation)
  downloadFile(taskId: number, fileName: string | null, event: Event): void {
    event.stopPropagation(); // MUY IMPORTANTE: Evita que el collapsible se cierre/abra al hacer clic en el botón

    if (!fileName) {
      alert('No hay un nombre de archivo válido para descargar.');
      return;
    }
    console.log(`Iniciando descarga para tarea ID: ${taskId}, archivo: ${fileName}`);
    this.orderService.downloadFile(taskId).subscribe({
      next: (blob) => {
        saveAs(blob, fileName);
        console.log('Descarga iniciada.');
      },
      error: (error) => {
        console.error('Error al descargar el archivo:', error);
        alert('No se pudo descargar el archivo. Verifica la consola.');
      }
    });
  }

  // Método para solicitar confirmación antes de eliminar
  askForDeleteConfirmation(taskId: number, index: number, taskName: string, event: Event): void {
    event.stopPropagation(); // Evita que el collapsible se cierre/abra
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
          console.log(`Tarea ${this.taskToDeleteId} eliminada.`);
          // En lugar de splice, recargamos las tareas
          this.loadTasks(); 
          this.resetDeleteState();
          // Ya no es necesario reinicializar collapsible aquí, loadTasks lo hará
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
    console.log('Eliminación cancelada.');
    this.resetDeleteState();
    // Recargar la lista de tareas al cancelar
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

  // Método deleteTask ahora solo llama a askForDeleteConfirmation
  // Lo mantenemos por si se usa en otro lugar, pero la lógica principal está en askForDeleteConfirmation
  deleteTask(taskId: number, index: number, taskName: string, event: Event): void {
     this.askForDeleteConfirmation(taskId, index, taskName, event);
  }

  // Añadir este método para manejar la edición
  navigateToEdit(taskId: number, event: Event): void {
    event.stopPropagation(); // Prevenir que el collapsible se abra/cierre
    this.router.navigate(['/form-task', taskId]);
  }
}