import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { HttpEventType, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';

@Component({
  standalone: true,
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  styleUrls: ['./form-task.component.css'],
  imports: [ReactiveFormsModule, CommonModule, ConfirmationPopupComponent]
})
export class FormTaskComponent implements OnInit {
  formTask: FormGroup;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
  private uploadSubscription: Subscription | null = null;
  isEditMode: boolean = false;
  taskId: string | null = null;
  currentFileName: string = '';

  // Propiedades para el popup de éxito
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
    // Inicializar formulario en el constructor
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

  goBack() {
    window.history.back(); // Regresa a la página anterior
  }

  private loadTaskData(taskId: string): void {
    this.orderService.getTaskById(taskId).subscribe({
      next: (task) => {
        let formattedDate = '';
        if (task.fechaLimite) {
          const date = new Date(task.fechaLimite);
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

        if (task.filePath) {
          this.currentFileName = task.filePath.split('\\').pop() || task.filePath.split('/').pop() || task.filePath;
        } else {
          this.currentFileName = '';
        }
      },
      error: (error) => {
        console.error('Error al cargar la tarea:', error);
        alert('Error al cargar los datos de la tarea');
      }
    });
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      if (!this.isEditMode) {
        this.currentFileName = this.selectedFile.name;
      }
      this.formTask.patchValue({ archivo: this.selectedFile });
    } else {
      this.selectedFile = null;
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
      return;
    }

    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;

    const formData = new FormData();
    const formValue = this.formTask.value;

    const fechaLimite = formValue.fechaLimite ? new Date(formValue.fechaLimite).toISOString().split('T')[0] : '';

    formData.append('nombre', formValue.nombre || '');
    formData.append('descripcion', formValue.descripcion || '');
    formData.append('fechaLimite', fechaLimite);
    formData.append('estado', formValue.estado || 'Pendiente');

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

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
          this.uploadStatus = 'success';
          this.showSuccessPopup = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error en la subida:', error);
        this.uploadStatus = 'error';
        alert(`Error al crear la tarea: ${error.message}`);
      },
      complete: () => {
        this.uploadSubscription = null;
      }
    });
  }

  createNewTask(): void {
    this.showSuccessPopup = false;
    this.resetFormAndState();
    this.uploadStatus = 'initial';
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/form-task']);
    });
  }

  goToTasks(): void {
    this.showSuccessPopup = false;
    this.router.navigate(['/tasks']);
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

    const fileInput = document.getElementById('archivo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}