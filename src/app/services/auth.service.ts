import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { EnvService } from './env.service';

export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
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
   * Verifica la existencia del token de autenticación al iniciar el servicio.
   * @private
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    // TODO: Implementar validación del token y obtención de datos del usuario
    if (token) {
      // Por ahora solo verificamos la existencia del token
    }
  }

  /**
   * Autentica al usuario y almacena su token
   * @param credentials - Credenciales de acceso
   * @returns Observable con el token y ID del usuario
   */
  login(credentials: LoginRequest): Observable<{ token: string; userId: string }> {
    return this.http.post<{ token: string; userId: string }>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Respuesta del backend:', response); // Depurar la respuesta
          localStorage.setItem(this.tokenKey, response.token); // Guardar el token
          const user: User = { // Crear un objeto User parcial
            id: response.userId,
            userName: '',
            email: '',
            fullName: ''
          };
          this.currentUserSubject.next(user); // Actualizar el BehaviorSubject
        })
      );
  }

  /**
   * Cierra la sesión y limpia los datos de autenticación
   */
  logout(): void {
    // Eliminar el token del localStorage
    localStorage.removeItem(this.tokenKey);
    // Actualizar el BehaviorSubject con null
    this.currentUserSubject.next(null);
  }

  /**
   * @returns Token JWT actual o null
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * @returns Estado de autenticación del usuario
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene el perfil del usuario desde la API
   * @returns Observable con la información del usuario
   */
  getUserProfile(): Observable<User> {
    const token = localStorage.getItem(this.tokenKey);
    return this.http.get<User>(`${this.apiUrl}/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Obtiene o actualiza los datos del usuario actual
   * @returns Observable con la información del usuario
   */
  getCurrentUser(): Observable<User | null> {
    if (!this.currentUserSubject.value) {
      this.getUserProfile().subscribe({
        next: (userData) => {
          console.log('Datos del usuario recibidos:', userData);
          this.currentUserSubject.next(userData); // Actualizar el BehaviorSubject
        },
        error: (error) => {
          console.error('Error al cargar el perfil:', error);
          this.currentUserSubject.next(null); // Actualizar el BehaviorSubject
        },
      });
    }
    return this.currentUser$;
  }
}