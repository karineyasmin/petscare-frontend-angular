import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PetsInfoService {
  private apiUrl = 'http://localhost:5264/api/PetsInfo'; // URL do seu backend

  constructor(private http: HttpClient) { }

  getBreeds(species: string): Observable<any[]> {
    console.log(`Buscando raças para espécie: ${species}`);
    return this.http.get<any[]>(`${this.apiUrl}/breeds?species=${species}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do backend
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else {
        errorMessage = `Código: ${error.status}, Mensagem: ${error.message}`;
      }
    }
    console.error('Erro na busca de raças:', error);
    return throwError(() => new Error(errorMessage));
  }
}