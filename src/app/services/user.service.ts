import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://localhost:44342/User'; // URL del controlador backend

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la información de un usuario específico mediante su ID.
   * @param id - El ID del usuario a buscar.
   * @returns Un Observable que emite la información del usuario encontrado.
   */
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}