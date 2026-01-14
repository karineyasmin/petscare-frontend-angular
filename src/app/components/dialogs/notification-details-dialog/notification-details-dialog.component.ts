import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Notification } from '../../../models/notification.model';

@Component({
  selector: 'app-notification-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  providers: [DatePipe],
  templateUrl: './notification-details-dialog.component.html',
  styleUrls: ['./notification-details-dialog.component.css']
})
export class NotificationDetailsDialog implements OnInit {
  formattedDate: string = '';

  constructor(
    public dialogRef: MatDialogRef<NotificationDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { notification: Notification },
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.formatDate();
  }

  formatDate(): void {
    if (this.data.notification?.sentAt) {
      this.formattedDate = this.datePipe.transform(
        this.data.notification.sentAt, 
        'dd/MM/yyyy HH:mm:ss'
      ) || '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status;
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'sent': return 'check_circle';
      case 'pending': return 'hourglass_empty';
      case 'failed': return 'error';
      default: return 'help';
    }
  }

  markAsRead(): void {
    this.dialogRef.close('markAsRead');
  }

  resendNotification(): void {
    this.dialogRef.close('resend');
  }

  close(): void {
    this.dialogRef.close();
  }
}