import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  /**
   * Intercepta las solicitudes HTTP salientes para añadir el token de autenticación.
   * Si existe un token JWT en AuthService, lo añade a la cabecera 'Authorization'.
   * @param request - La solicitud HTTP saliente.
   * @param next - El siguiente manejador en la cadena de interceptores.
   * @returns Un Observable del evento HTTP.
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(request);
  }
}