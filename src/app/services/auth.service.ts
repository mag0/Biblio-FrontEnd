import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
    // La propiedad 'fetch' no se utiliza y puede ser eliminada si no tiene un propósito específico.
    // this.fetch=http; // Comentado o eliminado si no es necesario.
    this.loadUserFromStorage();
  }

  /**
   * Carga la información del usuario desde el almacenamiento local si existe un token.
   * Intenta obtener el perfil del usuario si hay un token presente.
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token && !this.currentUserSubject.value) {
      // Si hay token y no hay usuario cargado, intenta obtener el perfil
      this.getUserProfile().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => {
          // Si falla la obtención del perfil (ej. token inválido), desloguea
          this.logout();
        }
      });
    }
  }

  /**
   * Realiza la solicitud de inicio de sesión al backend.
   * Guarda el token JWT en localStorage y actualiza el estado del usuario actual.
   * @param credentials Credenciales de login (email y password).
   * @returns Observable con la respuesta de autenticación (token y ID de usuario).
   */
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<{ token: string; userId: string }>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
          console.log('Token guardado tras login.');
        }),
        switchMap(() => {
          console.log('Intentando obtener perfil de usuario...');
          return this.getUserProfile();
        }),
        tap(userProfile => {
          console.log('Perfil de usuario obtenido y currentUserSubject actualizado:', userProfile);
        })
      );
  }

  /**
   * Cierra la sesión del usuario actual.
   * Elimina el token de localStorage y resetea el estado del usuario actual.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey); // Elimina el token
    this.currentUserSubject.next(null); // Notifica que no hay usuario logueado
  }

  /**
   * Obtiene el token de autenticación almacenado en localStorage.
   * Utilizado principalmente por el interceptor de autenticación.
   * @returns El token JWT o null si no está almacenado.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica si el usuario está actualmente autenticado.
   * @returns `true` si existe un token JWT válido en localStorage, `false` en caso contrario.
   */
  isAuthenticated(): boolean {
    // Considerar una validación más robusta del token si es necesario (ej. expiración)
    return !!this.getToken();
  }

  /**
   * Obtiene los datos del perfil del usuario autenticado desde el backend.
   * El token de autorización es añadido automáticamente por AuthInterceptor.
   * @returns Observable con los datos del usuario (interfaz User).
   */
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/me`).pipe(
      tap(user => {
        console.log('Perfil de usuario obtenido, actualizando currentUserSubject:', user);
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Error al obtener el perfil del usuario:', error);
        this.logout();
        return throwError(() => new Error('No se pudo obtener el perfil del usuario'));
      })
    );
  }

  /**
   * Obtiene un Observable que emite el estado actual del usuario (User | null).
   * Si el usuario no está cargado, intenta obtenerlo del backend.
   * @returns Observable del usuario actual.
   */
  getCurrentUser(): Observable<User | null> {
    // Si no hay usuario en el BehaviorSubject y hay token, intenta cargarlo.
    if (!this.currentUserSubject.value && this.getToken()) {
      this.getUserProfile().subscribe({
        next: (userData) => {
          console.log('Datos del usuario cargados bajo demanda:', userData);
          this.currentUserSubject.next(userData);
        },
        error: (error) => {
          console.error('Error al cargar el perfil bajo demanda:', error);
          // Si hay error (ej. token inválido), desloguear para limpiar estado.
          this.logout();
        },
      });
    }
    return this.currentUser$; // Devuelve el observable para suscripción
  }
}