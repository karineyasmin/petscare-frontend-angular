import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentEditDialog } from '../appointment-edit-dialog/appointment-edit-dialog.component';
import { AppointmentService } from '../../../services/appointment.service';

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
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private appointmentService: AppointmentService
  ) {
    // Formatar a data se não estiver no formato adequado
    if (typeof this.data.appointment.date === 'string' && !this.data.appointment.date.includes('/')) {
      const appointmentDate = new Date(this.data.appointment.date);
      this.data.appointment.formattedDate = this.datePipe.transform(appointmentDate, 'dd/MM/yyyy');
    } else if (!this.data.appointment.formattedDate) {
      this.data.appointment.formattedDate = this.data.appointment.date;
    }
  }
  
  close(): void {
    this.dialogRef.close();
  }
  
  editAppointment(): void {
    this.dialogRef.close();
    
    // Abrir o diálogo de edição
    const editDialogRef = this.dialog.open(AppointmentEditDialog, {
      width: '500px',
      data: { appointment: this.data.appointment }
    });
    
    // Processar resultado da edição
    editDialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Atualizar o agendamento
        this.appointmentService.updateAppointmentPartial(this.data.appointment.id, {
          serviceType: result.serviceType,
          date: result.date,
          time: result.time
        }).subscribe({
          next: () => {
            // Notificar quem chamou que houve uma atualização (opcional)
            // Pode ser útil para atualizar a lista de agendamentos
          },
          error: (err) => {
            console.error('Erro ao atualizar agendamento:', err);
          }
        });
      }
    });
  }

  // Métodos auxiliares para exibição de status
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
}