import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl: string;
  // Las propiedades 'fetch' y 'auth' no son necesarias aquí si el interceptor maneja el token.

  constructor(private http: HttpClient, private envService: EnvService /*, private authService: AuthService */) {
    // Construye la URL base para las operaciones de tareas.
    this.apiUrl = `${this.envService.getApiUrl()}/tarea`;
  }

  /**
   * Obtiene todas las tareas/órdenes desde el backend.
   * El token de autorización es añadido automáticamente por AuthInterceptor.
   * @returns Observable con un array de tareas.
   */
  getOrders(): Observable<any[]> {
    // No es necesario añadir encabezados manualmente, el interceptor lo hace.
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Envía una nueva tarea/orden al backend utilizando FormData (útil para archivos).
   * El token de autorización es añadido automáticamente por AuthInterceptor.
   * Observa los eventos HTTP para poder rastrear el progreso de la subida.
   * @param formData Datos del formulario, incluyendo posibles archivos.
   * @returns Observable con los eventos HTTP (incluyendo progreso y respuesta final).
   */
  createOrder(formData: FormData): Observable<any> {
    console.log(`OrderService: Intentando POST a: ${this.apiUrl}`);
    // No es necesario añadir encabezados manualmente.
    return this.http.post(this.apiUrl, formData, {
      reportProgress: true, // Para seguir el progreso de la subida
      observe: 'events'     // Para obtener todos los eventos, incluida la respuesta final
    });
  }

  /**
   * Descarga el archivo asociado a una tarea específica.
   * El token de autorización es añadido automáticamente por AuthInterceptor.
   * @param id El ID de la tarea cuyo archivo se desea descargar.
   * @returns Observable que emite el archivo como un Blob.
   */
  downloadFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/download/${id}`;
    console.log(`OrderService: Intentando GET para descarga desde: ${downloadUrl}`);
    // No es necesario añadir encabezados manualmente.
    return this.http.get(downloadUrl, {
      responseType: 'blob' // Indica que esperamos datos binarios (un archivo).
    });
  }

  /**
   * Elimina una tarea específica del backend.
   * El token de autorización es añadido automáticamente por AuthInterceptor.
   * @param id El ID de la tarea a eliminar.
   * @returns Observable que emite la respuesta del backend tras la eliminación.
   */
  deleteOrder(id: number): Observable<any> {
    const deleteUrl = `${this.apiUrl}/${id}`;
    console.log(`OrderService: Intentando DELETE a: ${deleteUrl}`);
    // No es necesario añadir encabezados manualmente.
    return this.http.delete(deleteUrl);
  }

  // Asegúrate de que no haya otros métodos que llamen a /upload
  // Si existe un método uploadFile, verifica que no se esté llamando desde form-task.component.ts
}