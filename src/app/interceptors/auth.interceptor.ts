import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asegúrate que la ruta es correcta

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Lista de rutas que no requieren token
    const publicRoutes = ['/auth/login', '/auth/register'];
    const isPublicRoute = publicRoutes.some(route => request.url.includes(route));
    const isUserMeRoute = request.url.includes('/user/me');

    console.log(`[Auth Interceptor] URL de la solicitud: ${request.url}`);
    console.log(`[Auth Interceptor] ¿Es ruta pública?: ${isPublicRoute}`);
    console.log(`[Auth Interceptor] ¿Es ruta /user/me?: ${isUserMeRoute}`);

    // Siempre añadir el token si está disponible, incluso para rutas públicas
    const token = this.authService.getToken();
    console.log(`[Auth Interceptor] Token presente: ${!!token}`);

    let requestToHandle = request;

    if (token) {
      requestToHandle = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('[Auth Interceptor] Token añadido a la solicitud');
    } else if (!isPublicRoute) {
      console.log('[Auth Interceptor] No hay token para ruta protegida, redirigiendo a login');
      this.router.navigate(['/login']);
      return throwError(() => new Error('No hay token de autenticación'));
    }

    return next.handle(requestToHandle).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(`[Auth Interceptor] Error detectado - Status: ${error.status}`);
        if (error.status === 401) {
          console.log('[Auth Interceptor] Error 401 detectado - Cerrando sesión');
          // Limpiar la sesión en cualquier error 401
          this.authService.logout();
          
          // Siempre redirigir al login en caso de error 401
          console.log('[Auth Interceptor] Redirigiendo a login después de error 401');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}