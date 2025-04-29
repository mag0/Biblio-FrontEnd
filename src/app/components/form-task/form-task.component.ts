import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core'; // Añadir OnDestroy si es necesario
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { OrderService } from '../../services/order.service';
import { HttpEventType, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http'; // Import HttpEvent, HttpErrorResponse
import { Subscription } from 'rxjs'; // Para gestionar suscripciones
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router } from '@angular/router'; // Import Router if not already present

declare var M: any; // Declaración global de Materialize

@Component({
  standalone: true, // Indica que el componente es standalone
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  styleUrls: ['./form-task.component.css'],
  // Ensure CommonModule and ReactiveFormsModule are imported for standalone components
  imports: [ReactiveFormsModule, CommonModule]
})
export class FormTaskComponent implements OnInit, AfterViewInit, OnDestroy {
  formTask!: FormGroup;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
  private uploadSubscription: Subscription | null = null;
  private formSelectInstance: any = null; // Para guardar la instancia del select

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router // Inject Router if needed for navigation
    ) {}

  ngOnInit(): void {
    this.formTask = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fechaCreacion: [this.getTodayDate(), Validators.required], // Valor inicial
      fechaLimite: [''],
      estado: ['', Validators.required], // Estado requerido
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
    // Cancelar subida si está en progreso
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
  }

  initializeMaterializeComponents(): void {
    try {
      // Inicializar Datepickers
      const datepickerElems = document.querySelectorAll('.datepicker');
      M.Datepicker.init(datepickerElems, {
        format: 'yyyy-mm-dd',
        autoClose: true,
        // i18n: { /* ... */ } // Configuración español si la necesitas
      });
      console.log('Materialize datepickers inicializados.');

      // Inicializar Selects
      const selectElems = document.querySelectorAll('select');
      if (selectElems.length > 0) {
        // Guardar la instancia para poder destruirla luego
        this.formSelectInstance = M.FormSelect.init(selectElems)[0]; // Asumiendo que solo hay un select principal que necesitamos gestionar
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
      this.formTask.patchValue({ archivo: this.selectedFile }); // Actualizar form control si es necesario
      this.uploadStatus = 'initial'; // Resetear estado al seleccionar nuevo archivo
      console.log('Archivo seleccionado:', this.selectedFile.name);
    } else {
      this.selectedFile = null;
      this.formTask.patchValue({ archivo: null });
    }
  }

  onSubmit(): void {
    if (this.formTask.invalid) {
      console.error('Formulario inválido.');
      this.formTask.markAllAsTouched(); // Marcar todos los campos para mostrar errores
      // Forzar reinicialización visual de Materialize select si hay error de validación
      setTimeout(() => this.initializeMaterializeComponents(), 0);
      return;
    }

    this.uploadStatus = 'uploading';
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

    // Use createOrder instead of createOrderWithFile
    this.uploadSubscription = this.orderService.createOrder(formData).subscribe({
      next: (event: HttpEvent<any>) => { // Add explicit type HttpEvent<any>
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          }
        } else if (event instanceof HttpResponse) {
          console.log('Respuesta completa:', event.body);
          this.uploadStatus = 'success';
          alert('Tarea creada con éxito.'); // Success message
          // Podrías resetear el form aquí o navegar a otra página
          this.resetFormAndState(); // Reset form on success
          this.router.navigate(['/tasks']); // Navigate to tasks list
        }
      },
      error: (error: HttpErrorResponse) => { // Add explicit type HttpErrorResponse
        console.error('Error en la subida:', error);
        this.uploadStatus = 'error';
        this.uploadProgress = 0;
        alert(`Error al crear la tarea: ${error.message}`); // Error message
        // Forzar reinicialización visual de Materialize select en caso de error
        setTimeout(() => this.initializeMaterializeComponents(), 0);
      }
    });
  }

  private resetFormAndState(): void {
    this.formTask.reset({
      nombre: '',
      descripcion: '',
      fechaCreacion: this.getTodayDate(),
      fechaLimite: '',
      estado: '', // Resetear estado a valor inicial vacío
      archivo: null
    });
    this.selectedFile = null;
    this.uploadStatus = 'initial';
    this.uploadProgress = 0;

    // Limpiar campos de archivo visualmente
    const fileInput = document.getElementById('archivo') as HTMLInputElement;
    const filePathInput = document.querySelector('.file-path') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    if (filePathInput) filePathInput.value = '';

    // Re-inicializar componentes Materialize después de resetear
    // Es crucial para que el select muestre el placeholder correcto
    setTimeout(() => this.initializeMaterializeComponents(), 0);
  }
}