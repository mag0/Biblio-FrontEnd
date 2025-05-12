import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // URL base para las operaciones relacionadas con las tareas/órdenes.
  private apiUrl = 'https://localhost:44342/api/Order';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las órdenes/tareas desde la API.
   * @returns Un Observable que emite un array de tareas.
   */
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Crea una nueva orden/tarea enviando datos de formulario.
   * Incluye seguimiento del progreso de subida.
   * @param formData Los datos del formulario para la nueva tarea.
   * @returns Un Observable que emite eventos HTTP, incluida la respuesta final.
   */
  createOrder(formData: FormData): Observable<any> {
    // *** Añade este console.log para depurar ***
    console.log(`OrderService: Intentando POST a: ${this.apiUrl}`);
    // La llamada POST debe usar solo this.apiUrl y observar los eventos
    return this.http.post(this.apiUrl, formData, {
      reportProgress: true, // Para seguir el progreso de la subida
      observe: 'events'     // Para obtener todos los eventos, incluida la respuesta final
    });
  }

  /**
   * Descarga el archivo asociado a una tarea específica.
   * @param id El ID de la tarea cuyo archivo se descargará.
   * @returns Un Observable que emite el archivo como un Blob.
   */
  downloadFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/download/${id}`;
    console.log(`OrderService: Intentando GET para descarga desde: ${downloadUrl}`);
    return this.http.get(downloadUrl, {
      responseType: 'blob'
    });
  }

  /**
   * Elimina una tarea específica.
   * @param id El ID de la tarea a eliminar.
   * @returns Un Observable que emite la respuesta de la API tras la eliminación.
   */
  deleteOrder(id: number): Observable<any> {
    const deleteUrl = `${this.apiUrl}/${id}`;
    console.log(`OrderService: Intentando DELETE a: ${deleteUrl}`);
    return this.http.delete(deleteUrl);
  }

  updateOrder(id: number, formData: FormData): Observable<any> {
    // Ensure the ID is included in the form data
    formData.append('id', id.toString());
    
    return this.http.put(`${this.apiUrl}/${id}`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  /**
   * Obtiene una tarea específica por su ID.
   * @param id El ID de la tarea a obtener.
   * @returns Un Observable que emite los datos de la tarea.
   */
  getTaskById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}