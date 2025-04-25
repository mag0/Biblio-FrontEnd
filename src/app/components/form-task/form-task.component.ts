import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service'; // Ruta relativa

@Component({
  standalone: true, // Indica que el componente es standalone
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  styleUrls: ['./form-task.component.css'],
  imports: [ReactiveFormsModule] // Importa los módulos necesarios aquí
})
export class FormTaskComponent {
  formTask!: FormGroup;

  constructor(private fb: FormBuilder, private orderService: OrderService) {
    console.log('Constructor inicializado.'); // Log para verificar el constructor
  }

  ngOnInit(): void {
    console.log('ngOnInit ejecutado.'); // Log para rastrear la inicialización del componente

    // Inicialización del formulario reactivo
    this.formTask = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      estado: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      fechaLimite: ['']
    });

    console.log('Formulario reactivo inicializado:', this.formTask.value); // Log del estado inicial del formulario
  }

  onSubmit(): void {
    console.log('onSubmit ejecutado.'); // Log para rastrear la ejecución del método

    if (this.formTask.invalid) {
      console.warn('Formulario inválido:', this.formTask.errors); // Log de las validaciones fallidas
      alert('Por favor completa los campos requeridos');
      return;
    }

    // Construcción del objeto que coincide con el modelo Order en el backend
    const orderData = {
      nombre: this.formTask.get('nombre')?.value,
      descripcion: this.formTask.get('descripcion')?.value,
      estado: this.formTask.get('estado')?.value,
      fechaCreacion: this.formTask.get('fechaCreacion')?.value,
      fechaLimite: this.formTask.get('fechaLimite')?.value
    };

    console.log('Datos preparados para enviar:', orderData); // Log de los datos a enviar

    // Enviar datos como JSON al backend
    this.orderService.createOrder(orderData).subscribe(
      response => {
        console.log('Respuesta del servidor:', response); // Log de la respuesta exitosa
        alert('Formulario enviado correctamente');
      },
      error => {
        console.error('Error al enviar el formulario:', error); // Log detallado del error
        alert('Hubo un problema al enviar los datos');
      }
    );
  }
}