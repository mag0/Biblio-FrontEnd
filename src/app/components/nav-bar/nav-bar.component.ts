import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
  standalone: true
})
export class NavBarComponent implements OnInit {
  title = 'BiblioAccess';
  isAuthenticated = false;
  mobileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios en el estado de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
    
    // Verificar el estado inicial de autenticación
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.mobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
