import { Component, OnInit, AfterViewInit } from '@angular/core'; // Re-añadir AfterViewInit
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { RouterLink } from '@angular/router';
import { saveAs } from 'file-saver';

declare var M: any; // Re-añadir declaración de Materialize

@Component({
  standalone: true,
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  imports: [CommonModule, RouterLink]
})
export class TasksComponent implements OnInit, AfterViewInit { // Re-añadir AfterViewInit
  tasks: any[] = [];
  isLoading: boolean = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngAfterViewInit(): void {
    // La inicialización se hará después de cargar los datos y renderizar
    // No la llamamos directamente aquí, sino después de obtener los datos.
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

  // Método para obtener clases CSS según el estado (se mantiene igual)
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pendiente': return 'status-pending';
      case 'en progreso': return 'status-in-progress'; // Asegúrate que este estado exista o ajústalo
      case 'completada': return 'status-completed'; // O 'Completado' si ese es el valor exacto
      default: return 'status-default';
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

  // Método para eliminar tarea (se mantiene igual, pero revisa event.stopPropagation)
  deleteTask(taskId: number, index: number, event: Event): void {
    event.stopPropagation(); // MUY IMPORTANTE: Evita que el collapsible se cierre/abra al hacer clic en el botón
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.orderService.deleteOrder(taskId).subscribe({
        next: () => {
          console.log(`Tarea ${taskId} eliminada.`);
          // Podríamos necesitar cerrar el item antes de eliminarlo visualmente
          // o simplemente dejar que se elimine.
          this.tasks.splice(index, 1);
          // Opcional: Reinicializar si la eliminación causa problemas de UI
          // setTimeout(() => this.initializeCollapsible(), 0);
        },
        error: error => {
          console.error('Error al eliminar la tarea:', error);
          alert('No se pudo eliminar la tarea.');
        }
      });
    }
  }
}