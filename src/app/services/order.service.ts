import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // URL base para las operaciones relacionadas con las tareas/órdenes.
  private apiUrl: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + "/order";
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createOrder(formData: FormData): Observable<any> {
    // La llamada POST debe usar solo this.apiUrl y observar los eventos
    return this.http.post(this.apiUrl, formData, {
      reportProgress: true, // Para seguir el progreso de la subida
      observe: 'events'     // Para obtener todos los eventos, incluida la respuesta final
    });
  }

  downloadFile(id: number): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/download/${id}`;

    return this.http.get(downloadUrl, {
      responseType: 'blob'
    });
  }

  deleteOrder(id: number): Observable<any> {
    const deleteUrl = `${this.apiUrl}/${id}`;

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

  getTaskById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}