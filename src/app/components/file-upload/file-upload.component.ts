import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpEventType } from '@angular/common/http';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
  standalone: true
})
export class FileUploadComponent {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  uploadStatus: 'initial' | 'uploading' | 'success' | 'error' = 'initial';
  errorMessage: string = '';
  
  constructor(private fileUploadService: FileUploadService) {}

  /**
   * Maneja la selección de archivos
   * @param event Evento de cambio del input file
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (this.fileUploadService.isValidFileType(file)) {
        this.selectedFile = file;
        this.errorMessage = '';
        this.uploadStatus = 'initial';
      } else {
        this.selectedFile = null;
        this.errorMessage = 'Solo se permiten archivos PDF, DOC o DOCX';
        this.uploadStatus = 'error';
        // Resetear el input
        input.value = '';
      }
    }
  }

  /**
   * Sube el archivo seleccionado al servidor
   */
  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Por favor, seleccione un archivo';
      this.uploadStatus = 'error';
      return;
    }

    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;

    this.fileUploadService.uploadFile(this.selectedFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
        } else if (event.type === HttpEventType.Response) {
          this.uploadStatus = 'success';
        }
      },
      error: (error) => {
        console.error('Error al subir el archivo:', error);
        this.errorMessage = 'Error al subir el archivo. Por favor, intente nuevamente.';
        this.uploadStatus = 'error';
      }
    });
  }

  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.uploadStatus = 'initial';
    this.errorMessage = '';
  }
}
