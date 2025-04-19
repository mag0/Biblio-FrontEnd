import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Si la ruta es login y el usuario está autenticado, redirigir al perfil
    if (state.url === '/login' && this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/profile']);
    }
    
    // Si la ruta requiere autenticación y el usuario no está autenticado, redirigir al login
    if (state.url !== '/login' && !this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }
    
    // En cualquier otro caso, permitir el acceso
    return true;
  }
}