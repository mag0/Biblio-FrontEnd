import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string; // URL del controlador backend

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl() + '/User';
  }

  /**
   * Obtiene la información de un usuario específico mediante su ID.
   * @param id - El ID del usuario a buscar.
   * @returns Un Observable que emite la información del usuario encontrado.
   */
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}