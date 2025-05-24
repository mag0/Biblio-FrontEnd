import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormTaskComponent } from '../ui/form-task/form-task.component';
import { OrderService } from '../../services/order.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ConfirmationPopupComponent } from '../ui/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-update-task',
  standalone: true,
  templateUrl: './update-task.component.html',
  imports: [FormTaskComponent, CommonModule, ConfirmationPopupComponent]
})
export class UpdateTaskComponent implements OnInit {
  taskId: string | null = null;
  uploadProgress: number = 0;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
  taskData: any = null;
  showConfirmPopup: boolean = false;
  formDataToSubmit?: FormData;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.taskId = params['id'];
        this.loadTaskData(Number(this.taskId));
      } else {
        this.router.navigate(['/tasks']);
      }
    });
  }

  private loadTaskData(taskId: number): void {
    this.orderService.getTaskById(taskId).subscribe({
      next: (task) => {
        this.taskData = task;
      },
      error: (error) => {
        console.error('Error al cargar la tarea:', error);
        this.router.navigate(['/tasks']);
      }
    });
  }

  onFormSubmit(formData: FormData): void {
    this.formDataToSubmit = formData;
    this.showConfirmPopup = true;
  }

  onConfirmSubmit(): void {
    if (!this.taskId || !this.formDataToSubmit) return;

    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;

    this.orderService.updateOrder(Number(this.taskId), this.formDataToSubmit).subscribe({
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
        console.error('Error al actualizar la tarea:', error);
        this.uploadStatus = 'error';
      }
    });
  }
}
