import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Declaramos `M` para utilizar Materialize
declare var M: any;

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  imports: [CommonModule],
  styleUrls: ['./tasks.component.css'] // Nota: Cambié `styleUrl` por `styleUrls` (esto podría ser un error tipográfico).
})
export class TasksComponent implements AfterViewInit {
  tasks = [
    {
      id: 1,
      nombre: 'Tarea 1',
      descripcion: 'Organizar las páginas para la sección de introducción.',
      vencimiento: '2025-05-01',
      estado: 'Disponible',
      dificultad: 'Alta',
      archivo: { nombre: 'intro-libro.pdf' },
      voluntario: null
    },
    {
      id: 2,
      nombre: 'Tarea 2',
      descripcion: 'Corregir errores de gramática en el primer capítulo.',
      vencimiento: '2025-05-02',
      estado: 'Pendiente',
      dificultad: 'Media',
      archivo: { nombre: 'capitulo-1.pdf' },
      voluntario: 'Juan Pérez'
    },
    {
      id: 3,
      nombre: 'Tarea 3',
      descripcion: 'Crear un diseño preliminar para la portada del libro.',
      vencimiento: '2025-05-03',
      estado: 'Completado',
      dificultad: 'Alta',
      archivo: { nombre: 'portada-diseño.pdf' },
      voluntario: 'Ana López'
    },
    {
      id: 4,
      nombre: 'Tarea 4',
      descripcion: 'Revisar las citas bibliográficas y corregir formatos incorrectos.',
      vencimiento: '2025-05-04',
      estado: 'Disponible',
      dificultad: 'Media',
      archivo: { nombre: 'bibliografia.pdf' },
      voluntario: null
    },
    {
      id: 5,
      nombre: 'Tarea 5',
      descripcion: 'Agregar nuevas secciones al índice del libro.',
      vencimiento: '2025-05-05',
      estado: 'Disponible',
      dificultad: 'Baja',
      archivo: { nombre: 'indice.pdf' },
      voluntario: null
    }
  ]

  // Usamos el ciclo de vida `AfterViewInit`
  ngAfterViewInit(): void {
    const elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems);
  }

  acceptTask(task: any, event: Event): void {
    event.stopPropagation(); // Evita que se despliegue el acordeón
    if (task.estado === 'Disponible') {
      task.estado = 'Pendiente'; // Cambiamos el estado a "Pendiente"
      task.voluntario = 'Tú'; // Asignamos al voluntario
    }
    console.log('Tarea aceptada:', task);
  }



}
