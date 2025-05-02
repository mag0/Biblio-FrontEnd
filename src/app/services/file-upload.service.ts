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
   * Sube un archivo al endpoint `/upload` del servidor.
   * Envía el archivo como parte de un FormData.
   * @param file - El archivo que se va a subir.
   * @returns Un Observable que emite eventos HTTP para seguir el progreso de la subida.
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
   * Envía un archivo al endpoint `/ocr/process` para su procesamiento OCR.
   * Envía el archivo como parte de un FormData.
   * @param file - El archivo PDF que se va a procesar.
   * @returns Un Observable que emite la respuesta JSON del servidor tras el procesamiento.
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
   * Comprueba si el tipo MIME del archivo está dentro de los tipos permitidos.
   * Tipos válidos: 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'.
   * @param file - El archivo a verificar.
   * @returns `true` si el tipo de archivo es válido, `false` en caso contrario.
   */
  isValidFileType(file: File): boolean {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return validTypes.includes(file.type);
  }
}