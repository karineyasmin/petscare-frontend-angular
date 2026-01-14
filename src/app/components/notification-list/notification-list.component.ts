import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationFilter } from '../../models/notification.model';
import { NotificationFilterComponent } from '../notification-filter/notification-filter.component';
import { NotificationDetailsDialog } from '../dialogs/notification-details-dialog/notification-details-dialog.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterModule,
    NotificationFilterComponent
  ],
  providers: [DatePipe],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  displayedNotifications: Notification[] = [];
  
  displayedColumns: string[] = ['status', 'sentAt', 'petName', 'subject', 'recipientEmail', 'actions'];
  
  loading: boolean = true;
  error: string | null = null;
  
  currentFilter: NotificationFilter = { status: 'all' };
  
  // Pagination
  pageSize: number = 10;
  currentPage: number = 0;
  totalItems: number = 0;

  constructor(
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;
    
    this.notificationService.getAllNotifications(this.currentFilter).subscribe({
      next: (notifications) => {
        this.notifications = notifications.map(notification => ({
          ...notification,
          formattedDate: this.formatDate(notification.sentAt)
        })) as any[];
        
        this.filteredNotifications = [...this.notifications];
        this.totalItems = this.filteredNotifications.length;
        this.updateDisplayedNotifications();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.error = err.message || 'Erro ao carregar notificações';
        this.loading = false;
      }
    });
  }

  onFilterChange(filter: NotificationFilter): void {
    this.currentFilter = filter;
    this.loadNotifications();
  }

  updateDisplayedNotifications(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedNotifications = this.filteredNotifications.slice(startIndex, endIndex);
  }

  openDetails(notification: Notification): void {
    const dialogRef = this.dialog.open(NotificationDetailsDialog, {
      width: '600px',
      data: { notification }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'markAsRead') {
        this.markAsRead(notification);
      } else if (result === 'resend') {
        this.resendNotification(notification);
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    
    this.loading = true;
    
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        const index = this.notifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          this.notifications[index] = { ...this.notifications[index], isRead: true };
          this.filteredNotifications = [...this.notifications];
          this.updateDisplayedNotifications();
        }
        
        this.showSuccessSnackBar('Notificação marcada como lida');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error marking notification as read:', err);
        this.showErrorSnackBar('Erro ao marcar notificação como lida');
        this.loading = false;
      }
    });
  }

  resendNotification(notification: Notification): void {
    if (notification.status !== 'failed') return;
    
    this.loading = true;
    
    this.notificationService.resendNotification(notification.id).subscribe({
      next: () => {
        const index = this.notifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          this.notifications[index] = { ...this.notifications[index], status: 'pending' };
          this.filteredNotifications = [...this.notifications];
          this.updateDisplayedNotifications();
        }
        
        this.showSuccessSnackBar('Notificação reenviada com sucesso');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error resending notification:', err);
        this.showErrorSnackBar('Erro ao reenviar notificação');
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedNotifications();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm') || '';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'sent': return 'check_circle';
      case 'pending': return 'hourglass_empty';
      case 'failed': return 'error';
      default: return 'help';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'sent': return 'status-sent';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  private showSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}