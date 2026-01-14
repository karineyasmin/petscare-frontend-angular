import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-appointment-details-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, MatDialogModule],
  providers: [DatePipe],
  templateUrl: './appointment-details-dialog.component.html',
  styleUrls: ['./appointment-details-dialog.component.css']
})
export class AppointmentDetailsDialog {
  constructor(
    public dialogRef: MatDialogRef<AppointmentDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { appointment: any },
    private datePipe: DatePipe
  ) {
    // Formatar a data se não estiver no formato adequado
    if (typeof this.data.appointment.date === 'string' && !this.data.appointment.date.includes('/')) {
      const appointmentDate = new Date(this.data.appointment.date);
      this.data.appointment.formattedDate = this.datePipe.transform(appointmentDate, 'dd/MM/yyyy');
    } else if (!this.data.appointment.formattedDate) {
      this.data.appointment.formattedDate = this.data.appointment.date;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'canceled': return 'status-canceled';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'canceled': return 'Cancelado';
      default: return status;
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}