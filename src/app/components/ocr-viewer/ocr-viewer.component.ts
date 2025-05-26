import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderManagmentService } from '../../services/orderManagment.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { OcrResponse } from '../../interfaces/ocr.interface';
import { OcrTextViewerComponent } from '../ui/ocr-text-viewer/ocr-text-viewer.component';
import { ActionButtonComponent } from '../ui/action-button/action-button.component';

@Component({
  selector: 'app-ocr-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, OcrTextViewerComponent, ActionButtonComponent],
  templateUrl: './ocr-viewer.component.html',
  styleUrl: './ocr-viewer.component.css'
})
export class OcrViewerComponent implements OnInit {
  @Input() ocrData: OcrResponse | null = null;
  isEditing: boolean = false;
  editingText: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  user: any;
  errorMessage: string = '';
  isRevision = false;
  taskId: number = 0;
  formData?: FormData;

  constructor(private router: Router, 
    private orderManagmentService: OrderManagmentService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));

    const storedData = localStorage.getItem('ocrData');
    if (storedData) {
      this.ocrData = JSON.parse(storedData);
      this.totalPages = this.ocrData?.metadata?.totalPages ?? 1; // Evita undefined/null
    }

    this.orderService.getTaskById(this.taskId).subscribe(task => {
      this.isRevision = task?.status === 'En Revisión';
      console.log('Estado de la tarea:', task?.status);
    });

    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.errorMessage = 'No se pudo cargar la información del perfil.';
      },
    });
  }

  finalizarProceso(): void {
    const getFormData = this.getFormData('En Revisión');
    this.orderManagmentService.changeStatus(getFormData).subscribe({
      next: () => {
        this.router.navigate(['/tasks/']);
      },
      error: (err) => {
        console.error('Error al cambiar el estado:', err);
      }
    });
  }
  
  denegarResultado(): void {
    const getFormData = this.getFormData('Denegada');
    this.orderManagmentService.changeStatus(getFormData).subscribe({
      next: () => {
        this.router.navigate(['/tasks/']);
      },
      error: (err) => {
        console.error('Error al cambiar el estado:', err);
      }
    });
  }
  
  finalizarRevision(): void {
    const getFormData = this.getFormData('Completada');
    this.orderManagmentService.changeStatus(getFormData).subscribe({
      next: () => {
        this.router.navigate(['/tasks/']);
      },
      error: (err) => {
        console.error('Error al cambiar el estado:', err);
      }
    });
  }

  getFormData(status: string): FormData {
    this.formData = new FormData();
    this.formData.append('id', this.taskId.toString());
    this.formData.append('status', status);
    return this.formData;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
    }
  }

  startEditing(): void {
    this.isEditing = true;
  }

  saveChanges(): void {
    if (!this.ocrData || !this.isEditing) return;
    localStorage.setItem('ocrData', JSON.stringify(this.ocrData));
    this.isEditing = false;
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  isToRevision(): boolean {
    return this.isRevision;
  }
}