import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5264/api/Auth'; // Verifique se essa porta está correta

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(username: string, password: string): Observable<any> {
    console.log('Tentando login para usuário:', username);
    
    return this.http.post<any>(`${this.baseUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        console.log('Resposta de login recebida:', response);
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(registerData: any): Observable<any> {
    console.log('Registrando novo usuário:', registerData.username);
    
    return this.http.post<any>(`${this.baseUrl}/register`, registerData)
      .pipe(
        tap(response => console.log('Resposta de registro:', response)),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): Observable<boolean> {
    const token = localStorage.getItem('token');
    return of(!!token);
  }

  // Método para obter o papel do usuário (admin ou user)
  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Decodificar o token JWT (parte simples)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
      console.error('Erro do cliente:', error.error.message);
    } else {
      // Erro retornado pelo backend
      console.error(
        `Código do erro: ${error.status}, ` +
        `Corpo: ${JSON.stringify(error.error)}`
      );
      
      if (error.status === 401) {
        errorMessage = 'Usuário ou senha inválidos';
      } else if (error.status === 400) {
        errorMessage = `Erro de validação: ${error.error}`;
      } else if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão e se o servidor está rodando.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.error || error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  checkTokenExpiration(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      // Decodifica o token JWT (parte simples)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Obtém a data de expiração do token
      const expirationTimestamp = payload.exp * 1000; // Converte para milissegundos
      const expirationDate = new Date(expirationTimestamp);
      
      // Verifica se o token expira em menos de 5 minutos
      const now = new Date();
      const timeRemaining = expirationDate.getTime() - now.getTime();
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      if (timeRemaining < fiveMinutesInMs) {
        console.warn('Token próximo da expiração. Realizando logout preventivo.');
        this.logout();
      }
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      // Se houver erro ao decodificar o token, é mais seguro fazer logout
      this.logout();
    }
  }
}