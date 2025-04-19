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
  user: User | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private authService: AuthService, private userService: UserService, private router: Router) {}

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

  const currentUser = this.authService.getCurrentUser(); // Obtener el usuario parcial
  const userId = currentUser?.id;
  console.log(currentUser)

  // if (!userId) {
  //   console.error('No se encontró un userId en el usuario actual.');
  //   this.errorMessage = 'No se pudo cargar el perfil porque el ID de usuario no está disponible.';
  //   this.isLoading = false;
  // }

}

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}