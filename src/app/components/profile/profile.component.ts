import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar los datos del perfil del usuario
    this.loadUserProfile();
  }

  /**
   * Carga los datos del perfil del usuario desde el API
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        this.user = userData;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.errorMessage = 'No se pudo cargar la información del perfil. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}