import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { saveAs } from 'file-saver';
import { FileUploadService } from '../../services/file-upload.service';
import { OrderManagmentService } from '../../services/orderManagment.service';
import { ActionButtonComponent } from '../ui/action-button/action-button.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, ActionButtonComponent],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  task: any = {};
  isLoading: boolean = true;
  errorMessage: string = '';
  isLibrarian: boolean = false;
  user: any;
  statusTask: string = '';
  taskId: number = 0;

  uploadProgress: number = 0;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  ocrResponse: any = null;
  selectedOcrProcessor: string = 'Local';
  isAlumno = true;
  isRevision = false;
  isCompleted = false;
  isDenegated = false;
  isEarring = false;
  isProcess = false;
  formData?: FormData;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private fileUploadService: FileUploadService,
    private orderManagmentService: OrderManagmentService
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.checkUserRole();
    this.loadTaskDetails();
    this.getStatus();
    this.isAlumno = this.authService.getCurrentUserRole() === 'Alumno';
  }

  getStatus(): void {
    this.orderService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.statusTask = task.status;
        this.isEarring = this.statusTask === 'Pendiente';
        this.isProcess = this.statusTask === 'En Proceso';
        this.isRevision = this.statusTask === 'En Revisión';
        this.isDenegated = this.statusTask === 'Denegada';
        this.isCompleted = this.statusTask === 'Completada';
      },
      error: (err) => {
        console.error('Error al obtener la tarea:', err);
      }
    });
  }

  private checkUserRole(): void {
    const userRole = this.authService.getCurrentUserRole();
    this.isLibrarian = userRole === 'Admin';
  }

  loadTaskDetails(): void {
    if (!this.taskId) {
      this.errorMessage = 'ID de tarea no válido';
      this.isLoading = false;
      return;
    }

    this.orderService.getTaskById(this.taskId).subscribe({
      next: (data: any) => {
        this.task = {
          ...data,
          fileName: data.filePath ? data.filePath.split(/[\\/]/).pop() : null
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los detalles de la tarea:', error);
        this.errorMessage = 'No se pudo cargar los detalles de la tarea';
        this.isLoading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'status-pendiente task-status-badge';
      case 'en proceso': return 'status-en-proceso task-status-badge';
      case 'en revisión': return 'status-en-revision task-status-badge';
      case 'denegada': return 'status-denegado task-status-badge';
      case 'completada': return 'status-completado task-status-badge';
      default: return 'status-pendiente task-status-badge';
    }
  }

  downloadFile(taskId: number, fileName: string | null): void {
    if (!taskId || taskId <= 0) {
      alert('ID de tarea inválido. No se puede descargar el archivo.');
      return;
    }
  
    if (!fileName) {
      alert('No hay un nombre de archivo válido para descargar.');
      return;
    }
  
    this.orderService.downloadFile(taskId).subscribe({
      next: (blob) => saveAs(blob, fileName),
      error: (error) => {
        console.error('Error al descargar el archivo:', error);
        alert('No se pudo descargar el archivo.');
      }
    });
  }

  processOcr(orderId: number, condition: boolean): void {
    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;
    this.ocrResponse = null;

    if(condition){
      this.formData = new FormData();
    this.formData.append('id', this.taskId.toString());
    this.formData.append('status', 'En Proceso');
      this.orderManagmentService.changeStatus(this.formData).subscribe({
      error: (err) => {
        console.error('Error al cambiar el estado:', err);
      }
    });
    }
    
  
    this.fileUploadService.newProcessOcr(orderId, this.selectedOcrProcessor).subscribe({
      next: (response) => {
        this.uploadStatus = 'success';
        this.uploadProgress = 100;
        this.ocrResponse = response;
  
        // Guardar los datos OCR en localStorage para que estén disponibles en la nueva vista
        localStorage.setItem('ocrData', JSON.stringify(response));
  
        // Redirigir al visualizador OCR
        this.router.navigate(['/ocr-viewer/' + orderId]);
      },
      error: (error) => {
        console.error('Error al procesar el archivo con OCR:', error);
        this.errorMessage = 'Error al procesar el archivo con OCR. Por favor, intente nuevamente.';
        this.uploadStatus = 'error';
      }
    });
  }

  navigateToEdit(): void {
    if (this.task) {
      this.router.navigate(['/form-task', this.task.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}