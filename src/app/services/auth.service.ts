import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { EnvService } from './env.service';

export interface User {
  id: string;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient, private envService: EnvService) {
    this.apiUrl = this.envService.getApiUrl(); // URL de la API desde el servicio de entorno
    // Intentar recuperar el usuario del localStorage al iniciar el servicio
    this.loadUserFromStorage();
  }

  /**
   * Carga el usuario desde el localStorage si existe un token guardado
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // Aquí podrías decodificar el token JWT para obtener la información del usuario
      // o hacer una petición al backend para obtener los datos del usuario actual
      // Por ahora, simplemente verificamos que existe un token
      // En una implementación real, deberías validar el token y obtener los datos del usuario
    }
  }

  /**
   * Inicia sesión con email y contraseña
   * @param credentials Credenciales de login (email y password)
   * @returns Observable con la respuesta de autenticación
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar el token en localStorage
          localStorage.setItem(this.tokenKey, response.token);
          // Actualizar el BehaviorSubject con el usuario actual
          this.currentUserSubject.next(response.user);
        })
      );
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout(): void {
    // Eliminar el token del localStorage
    localStorage.removeItem(this.tokenKey);
    // Actualizar el BehaviorSubject con null
    this.currentUserSubject.next(null);
  }

  /**
   * Obtiene el token de autenticación actual
   * @returns El token JWT o null si no hay sesión
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si hay un token guardado, false en caso contrario
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene los datos del perfil del usuario actual
   * @returns Observable con los datos del usuario
   */
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`);
  }
}