import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5000/Schedule/appointment';

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  // Headers HTTP
  private getHttpOptions() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  // Obter todos os agendamentos
  getAllAppointments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHttpOptions())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Obter agendamentos por ID de pet
  getAppointmentsByPetId(petId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pet/${petId}`, this.getHttpOptions())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Obter um agendamento específico
  getAppointment(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

     // Criar um novo agendamento
  createAppointment(appointment: any): Observable<any> {
    const request = {
      petId: appointment.petId,
      petName: appointment.petName,
      serviceType: appointment.serviceType,
      date: appointment.date,
      hour: appointment.time,
      ownerName: appointment.ownerName,
      ownerEmail: appointment.ownerEmail || ''
    };
  
    console.log('Sending properly mapped appointment to API:', request);
    
    return this.http.post<any>(this.apiUrl, request, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error response from server:', error);
          return this.handleError(error);
        })
      );
  }
  
  // Atualizar um agendamento
  updateAppointmentPartial(id: string, updates: {
    date?: string | Date,
    time?: string,
    serviceType?: string
  }): Observable<any> {
    // Preparar os dados para envio
    const formattedData: any = {};
    
    // Adicionar apenas os campos que existem nas atualizações
    if (updates.serviceType) {
      formattedData.serviceType = updates.serviceType;
    }
    
    if (updates.time) {
      formattedData.time = updates.time;
    }
    
    if (updates.date) {
      // Converter para formato dd/MM/yyyy se necessário
      if (updates.date instanceof Date) {
        const datePipe = new DatePipe('pt-BR');
        formattedData.date = datePipe.transform(updates.date, 'dd/MM/yyyy');
      } else if (typeof updates.date === 'string') {
        formattedData.date = updates.date;
      }
    }
    
    console.log('Enviando PATCH para atualizar parcialmente:', formattedData);
    
    // Usar método PATCH para atualização parcial
    return this.http.patch<any>(`${this.apiUrl}/${id}`, formattedData, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Erro na atualização parcial do agendamento:', error);
          // Tratamento específico para erro 405
          if (error.status === 405) {
            console.log('Erro 405 - Method Not Allowed. Tentando método alternativo...');
            // Fallback para PUT se PATCH não for suportado
            return this.updateAppointmentWithPut(id, formattedData);
          }
          return this.handleError(error);
        })
      );
  }

/**
 * Método de fallback usando PUT caso o PATCH não seja suportado
 */
private updateAppointmentWithPut(id: string, updates: any): Observable<any> {
  // Primeiro, obter o agendamento completo
  return this.getAppointment(id).pipe(
    switchMap(appointment => {
      // Mesclar os dados atuais com as atualizações
      const updatedAppointment = { ...appointment, ...updates };
      console.log('Fazendo fallback para PUT com dados mesclados:', updatedAppointment);
      // Chamar o endpoint PUT normal
      return this.http.put<any>(this.apiUrl, updatedAppointment, this.getHttpOptions());
    }),
    catchError(this.handleError)
  );
}
  
  // Atualizar apenas o status do agendamento
  updateAppointmentStatus(appointmentId: string, status: string): Observable<any> {
    const request = { appointmentId, status };
    return this.http.put<any>(`${this.apiUrl}/status`, request, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }
    
  // Excluir um agendamento
  deleteAppointment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  // Tratamento de erros HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente ou de rede
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // O backend retornou um código de erro
      switch (error.status) {
        case 405:
          errorMessage = 'Método HTTP não permitido. Verifique se a API suporta este tipo de operação.';
          break;
        case 400:
          errorMessage = `Dados inválidos: ${error.error?.message || 'Verifique os campos e tente novamente.'}`;
          break;
        case 401:
          errorMessage = 'Não autorizado. Sua sessão pode ter expirado.';
          break;
        case 403:
          errorMessage = 'Acesso proibido. Sua conta não tem permissão para realizar esta operação.';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado.';
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