import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { HttpEventType, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // Added ActivatedRoute
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';

declare var M: any;

@Component({
  standalone: true,
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  styleUrls: ['./form-task.component.css'],
  // Ensure CommonModule and ReactiveFormsModule are imported for standalone components
  imports: [ReactiveFormsModule, CommonModule, ConfirmationPopupComponent]
})
export class FormTaskComponent implements OnInit {
  formTask: FormGroup;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
  private uploadSubscription: Subscription | null = null;
  private formSelectInstance: any = null;
  isEditMode: boolean = false;
  taskId: string | null = null;
  currentFileName: string = '';

  // Properties for success popup
  showSuccessPopup: boolean = false;
  successPopupTitle: string = '¡Éxito!';
  successPopupMessage: string = 'La tarea se ha creado correctamente.';
  successConfirmButtonText: string = 'Crear Nueva Tarea';
  successCancelButtonText: string = 'Ver Tareas';

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize form in constructor
    this.formTask = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fechaLimite: [''],
      estado: ['Pendiente'],
      archivo: [null]
    });
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.taskId = params['id'];
        this.loadTaskData(params['id']);
      }
    });
  }

  private loadTaskData(taskId: string): void {
    this.orderService.getTaskById(taskId).subscribe({
      next: (task) => {
        // Formatear la fecha límite si existe
        let formattedDate = '';
        if (task.fechaLimite) {
          const date = new Date(task.fechaLimite);
          // Asegurarse de que la fecha esté en el formato correcto para el datepicker
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
  
        this.formTask.patchValue({
          nombre: task.nombre,
          descripcion: task.descripcion,
          fechaLimite: formattedDate,
          estado: task.estado
        });
        
        // Guardar el nombre del archivo actual si existe
        if (task.filePath) {
          // Extraer solo el nombre del archivo de la ruta completa
          this.currentFileName = task.filePath.split('\\').pop() || task.filePath.split('/').pop() || task.filePath;
          console.log('Archivo actual cargado:', this.currentFileName);
        } else {
          this.currentFileName = '';
        }
        
        // Reinicializar los componentes de Materialize después de cargar los datos
        setTimeout(() => {
          this.initializeMaterializeComponents();
        }, 0);
      },
      error: (error) => {
        console.error('Error al cargar la tarea:', error);
        // Mostrar mensaje de error al usuario
        M.toast({html: 'Error al cargar los datos de la tarea', classes: 'red'});
      }
    });
  }

  ngAfterViewInit(): void {
    // Usar setTimeout para asegurar que el DOM esté listo
    setTimeout(() => {
      this.initializeMaterializeComponents();
    }, 0);
  }

  private initializeMaterializeComponents(): void {
    try {
      // Inicializar Datepickers
      const datepickerElems = document.querySelectorAll('.datepicker');
      const datepickerInstances = M.Datepicker.init(datepickerElems, {
        format: 'yyyy-mm-dd',
        autoClose: true,
        onSelect: (date: Date) => {
          const formattedDate = date.toISOString().split('T')[0];
          this.formTask.patchValue({ fechaLimite: formattedDate });
        }
      });
  
      // Si estamos en modo edición y hay una fecha, establecerla
      if (this.isEditMode && this.formTask.get('fechaLimite')?.value) {
        datepickerInstances.forEach((instance: any) => {
          instance.setDate(new Date(this.formTask.get('fechaLimite')?.value));
        });
      }

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
      // En modo edición, mantener el nombre del archivo original
      if (!this.isEditMode) {
        this.currentFileName = this.selectedFile.name;
      }
      this.formTask.patchValue({ archivo: this.selectedFile });
      console.log('Archivo seleccionado:', this.selectedFile.name);
    } else {
      this.selectedFile = null;
      // Solo limpiar el nombre si no estamos en modo edición
      if (!this.isEditMode) {
        this.currentFileName = '';
      }
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

    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;

    const formData = new FormData();
    const formValue = this.formTask.value;
    
    // Asegurarse de que la fecha límite se formatee correctamente
    const fechaLimite = formValue.fechaLimite ? new Date(formValue.fechaLimite).toISOString().split('T')[0] : '';
    
    // Agregar cada campo al FormData, incluyendo explícitamente la fecha límite
    formData.append('nombre', formValue.nombre || '');
    formData.append('descripcion', formValue.descripcion || '');
    formData.append('fechaLimite', fechaLimite);
    formData.append('estado', formValue.estado || 'Pendiente');

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    // Determinar si estamos creando o actualizando
    const request = this.isEditMode ? 
      this.orderService.updateOrder(Number(this.taskId), formData) :
      this.orderService.createOrder(formData);

    this.uploadSubscription = request.subscribe({
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
    // Recargar la página actual navegando al mismo componente
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/form-task']);
    });
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
      fechaLimite: '',
      estado: 'Pendiente',
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