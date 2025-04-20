import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null; // Usuario cargado desde el API
  isLoading: boolean = true; // Indicador de carga
  errorMessage: string = ''; // Mensaje de error si ocurre algún fallo

  constructor(private authService: AuthService, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar el perfil del usuario
    this.loadUserProfile();
  }

  /**
   * Cargar los datos del perfil del usuario desde el backend
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        console.log('Datos del usuario recibidos:', userData);
        this.user = userData; // Asignar los datos a la propiedad `user`
        this.isLoading = false; // Marcar como completada la carga
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.errorMessage = 'No se pudo cargar la información del perfil.';
        this.isLoading = false; // Terminar el estado de carga
      },
    });
  }

  /**
   * Cerrar sesión del usuario
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}