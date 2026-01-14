import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToPetRegistration(): void {
    this.router.navigate(['/pet-registration']);
  }

  isAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.role === 'admin' || 
               decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'admin';
      } catch (error) {
        return false;
      }
    }
    return false;
  }
}