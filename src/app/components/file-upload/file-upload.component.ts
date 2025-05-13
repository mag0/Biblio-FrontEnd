import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { FileUploadService } from '../../services/file-upload.service';

declare global {
  interface Window {
    M: any;
  }
}

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
  standalone: true
})
export class FileUploadComponent{
  @ViewChild('ocrProcessor') ocrProcessorSelect!: ElementRef;
  
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  errorMessage: string = '';
  ocrResponse: any = null; // Para almacenar la respuesta JSON del OCR
  selectedOcrProcessor: string = 'Azure'; // Valor por defecto

  ngOnInit(): void {
    this.selectedOcrProcessor = 'Local';
  }
  constructor(private fileUploadService: FileUploadService, private router: Router) {}

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
        this.uploadStatus = 'idle';
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
   * Procesa un archivo PDF mediante OCR y muestra la respuesta JSON
   */
  processOcr(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Por favor, seleccione un archivo PDF';
      this.uploadStatus = 'error';
      return;
    }

    // Verificar que sea un PDF
    if (this.selectedFile.type !== 'application/pdf') {
      this.errorMessage = 'Solo se permiten archivos PDF para el procesamiento OCR';
      this.uploadStatus = 'error';
      return;
    }

    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;
    this.ocrResponse = null;

    this.fileUploadService.processOcr(this.selectedFile, this.selectedOcrProcessor).subscribe({
      next: (response) => {
        this.uploadStatus = 'success';
        this.uploadProgress = 100;
        this.ocrResponse = response;
        
        // Guardar los datos OCR en localStorage para que estén disponibles en el visualizador
        localStorage.setItem('ocrData', JSON.stringify(response));
        
        // Redirigir al visualizador OCR
        this.router.navigate(['/ocr-viewer']);
      },
      error: (error) => {
        console.error('Error al procesar el archivo con OCR:', error);
        this.errorMessage = 'Error al procesar el archivo con OCR. Por favor, intente nuevamente.';
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
    this.uploadStatus = 'idle';
    this.errorMessage = '';
    this.ocrResponse = null;
  }

  /**
   * Navega al visualizador OCR
   */
  goToOcrViewer(): void {
    this.router.navigate(['/ocr-viewer']);
  }
}
