import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderManagmentService {
  private apiUrl = 'https://localhost:44342/api/OrderManagment';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las tareas por estado.
   * @param estado El estado de las tareas a obtener.
   * @returns Un Observable con la lista de tareas filtradas.
   */
  getOrdersByState(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estado?estado=${estado}`);
  }

  /**
   * Obtiene todas las tareas asignadas a un usuario.
   * @param idUsuario El ID del usuario.
   * @returns Un Observable con la lista de tareas asignadas.
   */
  getAssignedOrders(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/asignadas?idUsuario=${idUsuario}`);
  }

  /**
   * Cambia el estado de una tarea a "En Proceso".
   * @param idTarea El ID de la tarea.
   * @param idUsuario El ID del usuario que realiza el cambio.
   * @returns Un Observable con la respuesta de la API.
   */
  changeStatusToInProgress(idTarea: number, idUsuario: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/enprogreso?idTarea=${idTarea}&idUsuario=${idUsuario}`, {});
  }

  /**
   * Cambia el estado de una tarea a "En Revisión".
   * @param idTarea El ID de la tarea.
   * @param idUsuario El ID del usuario que realiza el cambio.
   * @returns Un Observable con la respuesta de la API.
   */
  changeStatusToReview(idTarea: number, idUsuario: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/revision?idTarea=${idTarea}&idUsuario=${idUsuario}`, {});
  }

  /**
   * Cambia el estado de una tarea a "Completada".
   * @param idTarea El ID de la tarea.
   * @param idUsuario El ID del usuario que realiza el cambio.
   * @returns Un Observable con la respuesta de la API.
   */
  changeStatusToCompleted(idTarea: number, idUsuario: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/completada?idTarea=${idTarea}&idUsuario=${idUsuario}`, {});
  }

  /**
   * Cambia el estado de una tarea a "Denegada".
   * @param idTarea El ID de la tarea.
   * @param idUsuario El ID del usuario que realiza el cambio.
   * @returns Un Observable con la respuesta de la API.
   */
  changeStatusToDenied(idTarea: number, idUsuario: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/denegada?idTarea=${idTarea}&idUsuario=${idUsuario}`, {});
  }
}