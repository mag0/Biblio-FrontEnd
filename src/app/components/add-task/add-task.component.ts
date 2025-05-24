import { Component } from '@angular/core';
import { FormTaskComponent } from '../ui/form-task/form-task.component';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ConfirmationPopupComponent } from '../ui/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  imports: [FormTaskComponent, ConfirmationPopupComponent]
})
export class AddTaskComponent {
  uploadProgress: number = 0;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
  showConfirmPopup: boolean = false;
  formDataToSubmit?: FormData;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  onFormSubmit(formData: FormData): void {
    this.formDataToSubmit = formData;
    this.showConfirmPopup = true;
  }

  onConfirmSubmit(): void {
    if (!this.formDataToSubmit) return;

    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;

    this.orderService.createOrder(this.formDataToSubmit).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          }
        } else if (event instanceof HttpResponse) {
          this.uploadStatus = 'success';
          this.router.navigate(['/tasks']);
        }
      },
      error: (error) => {
        console.error('Error al crear la tarea:', error);
        this.uploadStatus = 'error';
      }
    });
  }
}
