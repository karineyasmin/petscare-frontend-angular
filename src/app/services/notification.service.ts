import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Notification, NotificationFilter } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5222/api/notifications';

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getAllNotifications(filter?: NotificationFilter): Observable<Notification[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.petId) params = params.set('petId', filter.petId);
      if (filter.status && filter.status !== 'all') params = params.set('status', filter.status);
      if (filter.type) params = params.set('type', filter.type);
      if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
      if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
    }

    return this.http.get<Notification[]>(this.apiUrl, { 
      ...this.getHttpOptions(), 
      params 
    }).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        return throwError(() => new Error('Erro ao carregar notificações: ' + error.message));
      })
    );
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/read`, {}, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error marking notification as read:', error);
          return throwError(() => new Error('Erro ao marcar notificação como lida: ' + error.message));
        })
      );
  }

  resendNotification(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/resend`, {}, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error resending notification:', error);
          return throwError(() => new Error('Erro ao reenviar notificação: ' + error.message));
        })
      );
  }
}