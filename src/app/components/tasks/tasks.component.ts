import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';

declare var M: any; // Declara Materialize para usar su funcionalidad JS

@Component({
  standalone: true,
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  imports: [CommonModule]
})
export class TasksComponent implements OnInit, AfterViewInit {
  tasks: any[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe(
      data => {
        this.tasks = data;
        console.log('Tareas obtenidas:', this.tasks);
      },
      error => {
        console.error('Error al obtener las tareas:', error);
      }
    );
  }

  ngAfterViewInit(): void {
    const elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems);
    console.log('Collapsible de Materialize inicializado.');
  }

  acceptTask(task: any, event: Event): void {
    console.log('Tarea aceptada:', task);
    // Aquí puedes manejar la lógica para aceptar tareas
  }

  deleteTask(taskId: number, index: number): void {
    console.log(`Eliminar tarea con ID: ${taskId} en índice: ${index}`);
    this.orderService.deleteOrder(taskId).subscribe(
      response => {
        console.log('Tarea eliminada:', response);
        this.tasks.splice(index, 1); // Remueve la tarea de la lista local
      },
      error => {
        console.error('Error al eliminar la tarea:', error);
      }
    );
  }
}