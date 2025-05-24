import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { OrderManagmentService } from '../../services/orderManagment.service';
import { CardTaskComponent } from '../ui/card-task/card-task.component';

@Component({
  standalone: true,
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  imports: [CommonModule, RouterLink, FormsModule, CardTaskComponent]
})
export class TasksComponent implements OnInit {
  tasks: any[] = [];
  isLoading: boolean = true;
  selectedEstado: string = '';
  isRol: string = '';
  isBibliotecario: boolean = false;
  isAlumno: boolean = false;
  isVoluntario: boolean = false;
  isRevisor: boolean = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private orderManagmentService: OrderManagmentService,
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.isRevisor = this.authService.hasRole('Voluntario Administrativo');
    this.isVoluntario = this.authService.hasRole('Voluntario');
    this.isBibliotecario = this.authService.hasRole('Bibliotecario') || this.authService.hasRole('Admin');
    this.isAlumno = this.authService.hasRole('Alumno');
  }

  async loadTasks(): Promise<void> {
    this.isLoading = true;
  console.log("loadTasks");

    const request = this.selectedEstado 
      ? this.orderManagmentService.getOrdersByState(this.selectedEstado) 
      : this.orderService.getOrders();

    await request.subscribe({
      next: (data: any[]) => {
        let filteredTasks = data;
  
        if (this.isVoluntario) {
          filteredTasks = filteredTasks.filter(task => task.status.toLowerCase() !== 'completada'
          && task.status.toLowerCase() !== 'en revisión' && task.status.toLowerCase() !== 'en proceso');
        } else if (this.isRevisor) {
          filteredTasks = filteredTasks.filter(task => task.status.toLowerCase() === 'en revisión');
        } else if (this.isAlumno) {
          filteredTasks = filteredTasks.filter(task => task.status.toLowerCase() === 'completada');
        }
  
        this.tasks = filteredTasks;
        this.isLoading = false;
      },
      error: error => {
        console.error('Error al obtener las tareas:', error);
        this.isLoading = false;
      }
    });
  }
  
}