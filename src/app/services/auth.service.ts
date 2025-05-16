import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { EnvService } from './env.service';
import { jwtDecode } from 'jwt-decode'; // Changed from import jwt_decode to import { jwtDecode }

export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  role?: string; // Añadir la propiedad role (puede ser opcional o requerida)
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
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  public userRole$ = this.userRoleSubject.asObservable();

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
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        
        // ASP.NET Core Identity usa este claim para roles
        const rolesClaim = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        const user: User = {
          id: decodedToken.sub || '',
          userName: decodedToken.userName || '',
          email: decodedToken.email || '',
          fullName: decodedToken.fullName || '',
          // Los roles pueden venir como array o string
          role: Array.isArray(rolesClaim) ? rolesClaim[0] : rolesClaim
        };
        this.currentUserSubject.next(user);
        this.userRoleSubject.next(user.role || null);
      } catch (error: any) {
        console.error('Error al decodificar el token:', error);
        console.error('Stack del error:', error?.stack);
        this.currentUserSubject.next(null);
      }
    }
  }

  login(credentials: LoginRequest): Observable<{ token: string; userId: string; role?: string }> {
    console.log("🟢 Iniciando proceso de login...");

    return this.http.post<{ token: string; userId: string; role?: string }>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log("✅ Respuesta de login recibida:", response);

          // Guardar el token en localStorage
          localStorage.setItem(this.tokenKey, response.token);
          console.log("🔹 Token guardado en localStorage");

          try {
            const decodedToken: any = jwtDecode(response.token);
            console.log("✅ Token decodificado correctamente:", decodedToken);

            // Extraer el rol del usuario
            const rolesClaim = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            
            const user: User = {
              id: decodedToken.sub || '',
              userName: decodedToken.userName || '',
              email: decodedToken.email || '',
              fullName: decodedToken.fullName || '',
              role: Array.isArray(rolesClaim) ? rolesClaim[0] : rolesClaim
            };

            console.log("✅ Usuario reconstruido:", user);

            // Actualizar el estado del usuario en la aplicación
            this.currentUserSubject.next(user);
            console.log("🔄 `currentUserSubject` actualizado.");

            this.userRoleSubject.next(user.role || null);
            console.log("🔄 `userRoleSubject` actualizado. Rol actual:", this.userRoleSubject.value);

          } catch (error) {
            console.error("❌ Error al decodificar el token en login:", error);
          }
        })
      );
}

  /**
   * Cierra la sesión y limpia los datos de autenticación
   */
  logout(): void {
    console.log("🔴 Cerrando sesión...");
    
    // Mostrar el rol antes de cerrar sesión
    console.log("🔹 Rol antes de logout:", this.userRoleSubject.value);
  
    // Eliminar el token del almacenamiento local
    localStorage.removeItem(this.tokenKey);
  
    // Resetear el estado del usuario y del rol
    this.currentUserSubject.next(null);
    this.userRoleSubject.next(null);
  
    // Confirmar que el rol ha sido reiniciado
    console.log("✅ Sesión cerrada, usuario y rol reiniciados.");
    console.log("🔹 Rol después de logout:", this.userRoleSubject.value);
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

  /**
   * Obtiene el rol del usuario actual
   * @returns string con el rol del usuario o null si no hay usuario o no tiene rol
   */
  getCurrentUserRole(): string | null {
    return this.userRoleSubject.value;
  }

  hasRole(role: string): boolean {
    return this.getCurrentUserRole() === role;
  }
}