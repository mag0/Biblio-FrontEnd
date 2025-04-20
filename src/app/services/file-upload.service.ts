import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl(); // URL de la API desde el servicio de entorno
  }

  /**
   * Sube un archivo al servidor
   * @param file El archivo a subir
   * @returns Observable con la respuesta del servidor
   */
  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const headers = new HttpHeaders();
    // No establecemos Content-Type ya que FormData lo establece automáticamente con el boundary

    return this.http.post<any>(`${this.apiUrl}/upload`, formData, {
      headers: headers,
      reportProgress: true,
      observe: 'events'
    });
  }

  /**
   * Procesa un archivo PDF mediante OCR
   * @param file El archivo PDF a procesar
   * @returns Observable con la respuesta JSON del servidor
   */
  processOcr(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const headers = new HttpHeaders();
    // No establecemos Content-Type ya que FormData lo establece automáticamente con el boundary

    return this.http.post<any>(`${this.apiUrl}/ocr/process`, formData, {
      headers: headers
    });
  }

  /**
   * Verifica si el tipo de archivo es válido (PDF, DOC, DOCX)
   * @param file El archivo a verificar
   * @returns true si el archivo es válido, false en caso contrario
   */
  isValidFileType(file: File): boolean {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return validTypes.includes(file.type);
  }
}