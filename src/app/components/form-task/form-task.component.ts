import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core'; // Añadir OnDestroy si es necesario
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { OrderService } from '../../services/order.service';
import { HttpEventType, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http'; // Import HttpEvent, HttpErrorResponse
import { Subscription } from 'rxjs'; // Para gestionar suscripciones
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router } from '@angular/router'; // Import Router if not already present
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component'; // Importar el popup

declare var M: any; // Declaración global de Materialize

@Component({
  standalone: true, // Indica que el componente es standalone
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  styleUrls: ['./form-task.component.css'],
  // Ensure CommonModule and ReactiveFormsModule are imported for standalone components
  imports: [ReactiveFormsModule, CommonModule, ConfirmationPopupComponent] // Añadir ConfirmationPopupComponent
})
export class FormTaskComponent implements OnInit, AfterViewInit, OnDestroy {
  formTask!: FormGroup;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
  private uploadSubscription: Subscription | null = null;
  private formSelectInstance: any = null; // Para guardar la instancia del select

  // Propiedades para el popup de éxito
  showSuccessPopup: boolean = false;
  successPopupTitle: string = '¡Éxito!';
  successPopupMessage: string = 'La tarea se ha creado correctamente.';
  successConfirmButtonText: string = 'Crear Nueva Tarea';
  successCancelButtonText: string = 'Ver Tareas';

  // Método para manejar el cierre del popup (al hacer clic fuera o en la X)
  onPopupClose(): void {
    this.showSuccessPopup = false;
    this.router.navigate(['/tasks']); // Redirigir a la vista de tareas
  }

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router // Inject Router if needed for navigation
    ) {}

  ngOnInit(): void {
    this.formTask = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fechaCreacion: [this.getTodayDate()], // Valor inicial oculto
      fechaLimite: [''],
      estado: ['Pendiente'], // Estado por defecto oculto
      archivo: [null] // Control para el archivo
    });
  }

  ngAfterViewInit(): void {
    this.initializeMaterializeComponents();
  }

  ngOnDestroy(): void {
    // Destruir instancia de FormSelect para evitar memory leaks
    if (this.formSelectInstance) {
      this.formSelectInstance.destroy();
    }
  }

  initializeMaterializeComponents(): void {
    try {
      // Inicializar Datepickers
      const datepickerElems = document.querySelectorAll('.datepicker');
      M.Datepicker.init(datepickerElems, {
        format: 'yyyy-mm-dd',
        autoClose: true,
      });
      console.log('Materialize datepickers inicializados.');

      // Inicializar Selects
      const selectElems = document.querySelectorAll('select');
      if (selectElems.length > 0) {
        this.formSelectInstance = M.FormSelect.init(selectElems)[0];
        console.log('Materialize selects inicializados.');
      } else {
        console.warn('No se encontraron elementos <select> para inicializar.');
      }

    } catch (e) {
      console.error('Error inicializando componentes Materialize:', e);
    }
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.formTask.patchValue({ archivo: this.selectedFile });
      console.log('Archivo seleccionado:', this.selectedFile.name);
    } else {
      this.selectedFile = null;
      this.formTask.patchValue({ archivo: null });
    }
  }

  onSubmit(): void {
    if (this.formTask.invalid) {
      console.error('Formulario inválido.');
      this.formTask.markAllAsTouched();
      setTimeout(() => this.initializeMaterializeComponents(), 0);
      return;
    }

    this.uploadStatus = 'uploading'; // Indicar que la subida ha comenzado
    this.uploadProgress = 0;

    const formData = new FormData();
    Object.keys(this.formTask.value).forEach(key => {
      if (key !== 'archivo' && this.formTask.value[key] !== null) {
        formData.append(key, this.formTask.value[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    console.log('Enviando datos:', this.formTask.value);

    this.uploadSubscription = this.orderService.createOrder(formData).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          }
        } else if (event instanceof HttpResponse) {
          console.log('Respuesta completa:', event.body);
          this.uploadStatus = 'success'; // Marcar como éxito
          // alert('Tarea creada con éxito.'); // Reemplazado por popup
          this.showSuccessPopup = true; // Mostrar el popup de éxito
          // No reseteamos ni navegamos aquí, lo hacemos en las acciones del popup
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error en la subida:', error);
        this.uploadStatus = 'error'; // Marcar como error
        alert(`Error al crear la tarea: ${error.message}`);
        setTimeout(() => this.initializeMaterializeComponents(), 0);
      },
      complete: () => {
        // Opcional: Limpiar suscripción si es necesario, aunque usualmente no para HTTP
        this.uploadSubscription = null;
      }
    });
  }

  // Acción para el botón 'Crear Nueva Tarea' del popup
  createNewTask(): void {
    this.showSuccessPopup = false; // Ocultar popup
    this.resetFormAndState(); // Resetear el formulario
    this.uploadStatus = 'initial'; // Resetear estado de subida
  }

  // Acción para el botón 'Ver Tareas' del popup
  goToTasks(): void {
    this.showSuccessPopup = false; // Ocultar popup
    this.router.navigate(['/tasks']); // Navegar a la lista de tareas
  }

  private resetFormAndState(): void {
    this.formTask.reset({
      nombre: '',
      descripcion: '',
      fechaCreacion: this.getTodayDate(),
      fechaLimite: '',
      estado: 'Pendiente', // Resetear a Pendiente
      archivo: null
    });
    this.selectedFile = null;
    this.uploadProgress = 0;
    // No resetear uploadStatus aquí, se maneja en onSubmit y acciones del popup

    const fileInput = document.getElementById('archivo') as HTMLInputElement;
    const filePathInput = document.querySelector('.file-path') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    if (filePathInput) filePathInput.value = '';

    // Re-inicializar selects y datepickers si es necesario después del reset
    setTimeout(() => this.initializeMaterializeComponents(), 0);
  }
}