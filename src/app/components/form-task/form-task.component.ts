import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service'; // Ruta relativa
import { HttpEventType, HttpResponse } from '@angular/common/http'; // Importar HttpEventType y HttpResponse
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { Router } from '@angular/router';

@Component({
  standalone: true, // Indica que el componente es standalone
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  styleUrls: ['./form-task.component.css'],
  imports: [ReactiveFormsModule, CommonModule] // Importa los módulos necesarios aquí, incluyendo CommonModule
})
export class FormTaskComponent {
  formTask!: FormGroup;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial'; // Estado de la carga
  uploadProgress: number = 0; // Progreso de la carga
  selectedFile: File | null = null; // Archivo seleccionado

  constructor(private fb: FormBuilder, private orderService: OrderService, private router: Router) {
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

    console.log('Datos del formulario preparados:', orderData); // Log de los datos a enviar

    if (this.selectedFile) {
      console.log('Archivo seleccionado para subir:', this.selectedFile.name);
      this.uploadStatus = 'uploading';
      this.uploadProgress = 0;

      this.orderService.uploadFile(this.selectedFile).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(100 * (event.loaded / event.total));
            console.log(`Progreso de carga: ${this.uploadProgress}%`);
          } else if (event.type === HttpEventType.Response) {
            console.log('Respuesta del servidor (carga de archivo):', event.body); // Loguear la respuesta
            this.uploadStatus = 'success';
            alert('Archivo subido correctamente. Enviando formulario...');
            // Ahora que el archivo se subió, enviar los datos del formulario
            this.submitFormData(orderData);
          }
        },
        error: (error) => {
          console.error('Error al subir el archivo:', error);
          this.uploadStatus = 'error';
          // Verificar si el error es HttpErrorResponse y si la respuesta es texto
          if (error.error instanceof ProgressEvent) {
            alert('Error de red o conexión al subir el archivo.');
          } else if (typeof error.error === 'string') {
            // Si el backend envió texto (ej. 'File uploaded successfully') pero HttpClient esperaba JSON
            console.warn('El backend respondió con texto, pero se esperaba JSON. Asumiendo éxito si el status es 2xx.');
            if (error.status >= 200 && error.status < 300) {
              this.uploadStatus = 'success';
              alert('Archivo subido (respuesta de texto). Enviando formulario...');
              console.log('>>> onSubmit: Llamando a submitFormData después de subir archivo (respuesta texto).');
              this.submitFormData(orderData);
            } else {
              alert(`Hubo un problema al subir el archivo: ${error.statusText}`);
            }
          } else {
            alert('Hubo un problema al subir el archivo.');
          }
        }
      });
    } else {
      console.log('No hay archivo seleccionado, enviando solo datos del formulario.');
      // Si no hay archivo, enviar solo los datos del formulario
      this.submitFormData(orderData);
    }

    // Redirigir a la vista de tareas después de enviar el formulario
    this.router.navigate(['/tasks']);
  }

  // Método auxiliar para enviar los datos del formulario
  private submitFormData(orderData: any): void {
    console.log('Enviando datos del formulario:', orderData);
    this.orderService.createOrder(orderData).subscribe(
      response => {
        console.log('Respuesta del servidor (envío de formulario):', response);
        alert('Formulario enviado correctamente');
        // Opcional: Resetear formulario y estado de carga
        this.formTask.reset();
        this.selectedFile = null;
        this.uploadStatus = 'initial';
        this.uploadProgress = 0;
        // Limpiar el input de archivo visualmente (puede requerir manipulación del DOM o ViewChild)
        const fileInput = document.getElementById('archivo') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error => {
        console.error('Error al enviar el formulario:', error);
        alert('Hubo un problema al enviar los datos del formulario');
        // No resetear el estado de carga aquí para permitir reintentos si es necesario
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      // Opcional: Podrías querer añadir validación del tipo de archivo aquí
      // Opcional: Actualizar un FormControl si el archivo es parte del formulario reactivo
      // this.formTask.patchValue({ archivo: file }); // Ejemplo si tuvieras un control 'archivo'
      console.log('Archivo seleccionado:', file.name);
    } else {
      this.selectedFile = null;
      // Opcional: Limpiar el FormControl si es necesario
      // this.formTask.patchValue({ archivo: null });
      console.log('No se seleccionó ningún archivo.');
    }
  }

  // El método uploadFile() ya no es necesario como acción separada del botón
  // Se elimina o se comenta si prefieres mantenerlo para referencia futura.
  /*
  uploadFile(): void { 
    if (!this.selectedFile) {
      alert('Por favor, selecciona un archivo primero.');
      console.warn('Intento de subir sin archivo seleccionado.');
      return; 
    }

    const fileToUpload = this.selectedFile;
    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;

    this.orderService.uploadFile(fileToUpload).subscribe({
      next: (event: any) => { 
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
          console.log(`Progreso de carga: ${this.uploadProgress}%`);
        } else if (event.type === HttpEventType.Response) {
          console.log('Respuesta del servidor (carga de archivo):', event.body);
          this.uploadStatus = 'success';
          alert('Archivo subido correctamente');
        }
      },
      error: (error) => {
        console.error('Error al subir el archivo:', error);
        this.uploadStatus = 'error';
        alert('Hubo un problema al subir el archivo');
      }
    });
  }
  */
}