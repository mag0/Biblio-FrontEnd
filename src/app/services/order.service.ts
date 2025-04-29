import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Asegúrate que esta URL es correcta y NO tiene /upload
  private apiUrl = 'https://localhost:44342/api/tarea';

  constructor(private http: HttpClient) {}

  // Método para obtener todas las órdenes/tareas
  getOrders(): Observable<any[]> { // Asume que devuelve un array de tareas
    return this.http.get<any[]>(this.apiUrl);
  }

  // Método para crear una nueva orden usando FormData
  createOrder(formData: FormData): Observable<any> {
    // *** Añade este console.log para depurar ***
    console.log(`OrderService: Intentando POST a: ${this.apiUrl}`);
    // La llamada POST debe usar solo this.apiUrl y observar los eventos
    return this.http.post(this.apiUrl, formData, {
      reportProgress: true, // Para seguir el progreso de la subida
      observe: 'events'     // Para obtener todos los eventos, incluida la respuesta final
    });
  }

  // Método para descargar un archivo asociado a una tarea
  downloadFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/download/${id}`;
    console.log(`OrderService: Intentando GET para descarga desde: ${downloadUrl}`);
    return this.http.get(downloadUrl, {
      responseType: 'blob'
    });
  }

  // Método para eliminar una tarea
  deleteOrder(id: number): Observable<any> {
    const deleteUrl = `${this.apiUrl}/${id}`;
    console.log(`OrderService: Intentando DELETE a: ${deleteUrl}`);
    return this.http.delete(deleteUrl);
  }

  // Asegúrate de que no haya otros métodos que llamen a /upload
  // Si existe un método uploadFile, verifica que no se esté llamando desde form-task.component.ts
}