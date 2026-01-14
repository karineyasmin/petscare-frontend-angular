// src/app/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  
  constructor(private router: Router) {}
  
  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    
    try {
      const decodedToken: any = jwtDecode(token);
      const isAdmin = 
        decodedToken.role === 'admin' || 
        decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'admin';
        
      if (!isAdmin) {
        this.router.navigate(['/']);
        return false;
      }
      
      return true;
    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}