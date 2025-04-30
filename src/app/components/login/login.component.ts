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
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (user) => { // El método login ahora emite el objeto User
        // No establecer isLoading aquí, se hará dentro del setTimeout
        console.log('LoginComponent: Login exitoso, usuario recibido:', user);
        // Redirigir al perfil después de iniciar sesión y obtener el perfil
        // Usar setTimeout para asegurar que la detección de cambios se ejecute antes de navegar
        setTimeout(() => {
          this.isLoading = false; // Asegurarse que isLoading se actualice antes de navegar
          this.router.navigate(['/profile']);
        }, 0);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error de inicio de sesión:', error);
        this.errorMessage = 'Credenciales inválidas. Por favor, intente nuevamente.';
      }
    });
  }
}