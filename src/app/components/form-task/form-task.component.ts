import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-task',
  standalone: true, // Declaración de componente independiente
  imports: [FormsModule], // Importa FormsModule aquí
  templateUrl: './form-task.component.html',
})
export class FormTaskComponent {
  tarea = {
    nombre: '',
    estado: 'Disponible',
    descripcion: '',
    vencimiento: '',
    dificultad: '',
    voluntario: '',
    archivo: null,
  };

  guardarTarea() {
    console.log('Nueva tarea:', this.tarea);
    alert('Tarea registrada exitosamente');
    this.tarea = {
      nombre: '',
      estado: 'Disponible',
      descripcion: '',
      vencimiento: '',
      dificultad: '',
      voluntario: '',
      archivo: null,
    }; // Limpiar el formulario
  }
}