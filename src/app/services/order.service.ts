import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la aplicación
})
export class OrderService {
  private apiUrl = 'https://localhost:44342/api/tarea'; // URL del endpoint

  constructor(private http: HttpClient) {}

  // Método para crear una nueva orden
  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.apiUrl, orderData, {
      headers: { 'Content-Type': 'application/json' } // Configuración del tipo de contenido
    });
  }

  // Método para obtener todas las órdenes (opcional)
  getOrders(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Método para obtener una orden específica por ID (opcional)
  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Método para actualizar una orden existente (opcional)
  updateOrder(id: number, orderData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, orderData, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Método para eliminar una orden por ID (opcional)
  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}