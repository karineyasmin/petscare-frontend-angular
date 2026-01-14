import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'http://localhost:5264/api/Pets'; // URL do seu backend

  constructor(private http: HttpClient) { }

  /**
   * Registra um novo pet no sistema
   */
  registerPet(pet: {
    species: string;
    breedId: string;
    name: string;
    age: number;
    sex: string;
    weight: number;
    ownerName: string;
    ownerEmail: string;
  }): Observable<any> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Nenhum token encontrado. Usuário não está autenticado.');
      return throwError(() => new Error('Não autenticado. Faça login novamente.'));
    }
    
    // Log para depuração
    console.log('Token usado na requisição:', token);
    console.log('Dados enviados para cadastro:', pet);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  
    // Garantir que o breedId não esteja vazio
    if (!pet.breedId || pet.breedId.trim() === '') {
      return throwError(() => new Error('ID da Raça é obrigatório'));
    }
  
    return this.http.post<any>(this.apiUrl, pet, { headers })
      .pipe(
        retry(1), // Tenta a requisição mais uma vez se falhar
        catchError(error => {
          console.error('Erro detalhado no cadastro:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtém todos os pets cadastrados
   */
    getAllPets(species?: string, breed?: string, name?: string): Observable<any[]> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Nenhum token encontrado. Usuário não está autenticado.');
      return throwError(() => new Error('Não autenticado. Faça login novamente.'));
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  
    // Construindo a URL com parâmetros de consulta
    let searchUrl = `${this.apiUrl}/search`;
    const params: string[] = [];
    
    if (species) params.push(`species=${encodeURIComponent(species)}`);
    if (breed) params.push(`breed=${encodeURIComponent(breed)}`);
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    
    if (params.length > 0) {
      searchUrl += `?${params.join('&')}`;
    }
    
    console.log('Fazendo requisição para obter pets');
    console.log('URL da requisição:', searchUrl);
    
    return this.http.get<any[]>(searchUrl, { headers })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Erro detalhado na listagem de pets:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtém detalhes de um pet específico
   */
  getPetDetails(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Nenhum token encontrado. Usuário não está autenticado.');
      return throwError(() => new Error('Não autenticado. Faça login novamente.'));
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        catchError(error => {
          console.error(`Erro ao obter detalhes do pet ${id}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Deleta um pet pelo ID
   */
  deletePet(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Nenhum token encontrado. Usuário não está autenticado.');
      return throwError(() => new Error('Não autenticado. Faça login novamente.'));
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        catchError(error => {
          console.error(`Erro ao deletar pet ${id}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Atualiza informações de um pet existente
   */
  updatePet(id: string, pet: {
    name: string;
    age: number;
    sex: string;
    weight: number;
    ownerName: string;
    ownerEmail: string;
  }): Observable<any> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Nenhum token encontrado. Usuário não está autenticado.');
      return throwError(() => new Error('Não autenticado. Faça login novamente.'));
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/${id}`, pet, { headers })
      .pipe(
        catchError(error => {
          console.error(`Erro ao atualizar pet ${id}:`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Busca pets com um termo específico
   */
  searchPets(query: string): Observable<any[]> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Nenhum token encontrado. Usuário não está autenticado.');
      return throwError(() => new Error('Não autenticado. Faça login novamente.'));
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/search?query=${query}`, { headers })
      .pipe(
        catchError(error => {
          console.error(`Erro na busca de pets com termo "${query}":`, error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Tratamento aprimorado de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    // Especificamente tratando o erro "Failed to fetch"
    if (!error.status && error.error instanceof ProgressEvent) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando e acessível.';
      console.error('Erro de conexão:', error);
      return throwError(() => new Error(errorMessage));
    }
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do backend
      switch (error.status) {
        case 401:
          errorMessage = 'Não autorizado. Verifique se você tem permissões e está logado corretamente.';
          break;
        case 403:
          errorMessage = 'Acesso proibido. Sua conta não tem permissão para realizar esta operação.';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado. O pet solicitado não existe ou foi removido.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
          break;
        case 0:
          errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
          break;
        default:
          errorMessage = `Código: ${error.status}, Mensagem: ${error.error?.message || error.statusText || 'Erro desconhecido'}`;
      }
    }
    
    console.error('Erro na requisição HTTP:', error);
    return throwError(() => new Error(errorMessage));
  }
}