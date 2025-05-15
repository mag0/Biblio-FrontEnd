import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { saveAs } from 'file-saver';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  task: any = {};
  isLoading: boolean = true;
  errorMessage: string = '';
  isLibrarian: boolean = false;

  uploadProgress: number = 0;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  ocrResponse: any = null; // Para almacenar la respuesta JSON del OCR
  selectedOcrProcessor: string = 'Local'; // Valor por defecto

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadTaskDetails();
  }

  private checkUserRole(): void {
    const userRole = this.authService.getCurrentUserRole();
    this.isLibrarian = userRole === 'Admin';
  }

  loadTaskDetails(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (!taskId) {
      this.errorMessage = 'ID de tarea no válido';
      this.isLoading = false;
      return;
    }

    this.orderService.getTaskById(taskId).subscribe({
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
      case 'pendiente': return 'badge-pendiente task-status-badge';
      case 'en proceso': return 'badge-en-proceso task-status-badge';
      case 'en revisión': return 'badge-en-revision task-status-badge';
      case 'denegado': return 'badge-denegado task-status-badge';
      case 'completado': return 'badge-completado task-status-badge';
      default: return 'badge-pendiente task-status-badge';
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

  processOcr(orderId: number): void {
    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;
    this.ocrResponse = null;
  
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