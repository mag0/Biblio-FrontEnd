import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Procesa el envío del formulario de inicio de sesión.
   * Llama al servicio de autenticación y redirige al perfil si tiene éxito,
   * o muestra un mensaje de error en caso contrario.
   */
  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoading = false;
        // Redirigir al perfil después de iniciar sesión
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error de inicio de sesión:', error);
        this.errorMessage = 'Credenciales inválidas. Por favor, intente nuevamente.';
      }
    });
  }
}