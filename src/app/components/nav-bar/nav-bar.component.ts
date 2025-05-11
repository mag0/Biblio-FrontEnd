import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AfterViewInit } from '@angular/core';

declare const M: any;

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
  standalone: true
})
export class NavBarComponent implements OnInit, AfterViewInit {
  title = 'BiblioAccess';
  isAuthenticated = false;
  mobileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Suscribirse a los cambios en el estado de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (this.isAuthenticated) {
        // Inicializar los elementos de Materialize después de la autenticación
        setTimeout(() => this.initializeMaterializeElements(), 0);
      }
    });

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Verificar el estado inicial de autenticación
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  ngAfterViewInit(): void {
    if (this.isAuthenticated) {
      this.initializeMaterializeElements();
    }
  }

  private initializeMaterializeElements(): void {
    // Inicializar sidenav
    const sidenavElems = document.querySelectorAll('.sidenav');
    if (sidenavElems.length > 0) {
      M.Sidenav.init(sidenavElems);
    }

    // Inicializar dropdown
    const dropdownElems = document.querySelectorAll('.dropdown-trigger');
    if (dropdownElems.length > 0) {
      M.Dropdown.init(dropdownElems, {
        coverTrigger: false,
        constrainWidth: false
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
