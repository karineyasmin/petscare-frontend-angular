import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { MaterialModule } from '../../material.module';

// Define an interface for the JWT payload
interface UserJwtPayload {
  sub?: string;
  name?: string;
  role?: string;
  exp?: number;
  [key: string]: any; // For any other claims
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuActive = false;
  userName = ''; 

  constructor(private router: Router) {
    this.userName = this.getUsername();
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUsername(): string {
    if (this.isLoggedIn()) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode<UserJwtPayload>(token);
          // Check for name, sub (standard claim), or use default
          return decodedToken.name || decodedToken.sub || 'Usuário';
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }
    return 'Usuário';
  }

  isAdmin(): boolean {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode<UserJwtPayload>(token);
        // Check standard role property or Microsoft's role claim
        return decodedToken.role === 'admin' || 
               decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'admin';
      }
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  
  menuItems = [
    // ... outros itens existentes
    {
      label: 'Notificações',
      icon: 'notifications',
      route: '/notifications',
      requiredRole: ['user', 'admin']
    },
  ];
}