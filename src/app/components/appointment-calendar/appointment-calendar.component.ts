import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { FullCalendarModule } from '@fullcalendar/angular';

import { AppointmentService } from '../../services/appointment.service';
import { AppointmentCreateDialog } from '../dialogs/appointment-create-dialog/appointment-create-dialog.component';
import { AppointmentDetailsDialog } from '../dialogs/appointment-details-dialog/appointment-details-dialog.component';
import { ConfirmDialog } from '../dialogs/confirm-dialog/confirm-dialog.component';

// Define appointment types directly in the component
enum AppointmentType {
  VACINACAO = 'Vacinação',
  CASTRACAO = 'Castração',
  CHECK_UP_INICIAL = 'Check up inicial',
  EXAMES = 'Exames',
  MEDICACAO = 'Medicação',
  CONSULTA = 'Consulta',
  BANHO_E_TOSA = 'Banho e tosa'
}

enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    RouterModule,
    FullCalendarModule
  ],
  providers: [DatePipe],
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.css']
})
export class AppointmentCalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    locale: 'pt-br',
    events: [],
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    nowIndicator: true,
    firstDay: 1 // Segunda-feira como primeiro dia da semana
  };
  
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        console.log('Agendamentos carregados para o calendário:', appointments);
        
        const events: EventInput[] = appointments.map(appointment => {
          // Parse date and time
          let startDate: Date;
          
          // Handle different date formats
          if (typeof appointment.date === 'string') {
            if (appointment.date.includes('/')) {
              // Format dd/MM/yyyy
              const [day, month, year] = appointment.date.split('/');
              const [hours, minutes] = appointment.time.split(':');
              startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 
                                parseInt(hours), parseInt(minutes));
            } else {
              // ISO format or other
              startDate = new Date(appointment.date);
              const [hours, minutes] = appointment.time.split(':');
              startDate.setHours(parseInt(hours), parseInt(minutes));
            }
          } else if (appointment.date instanceof Date) {
            // If it's already a Date object
            startDate = new Date(appointment.date);
            const [hours, minutes] = appointment.time.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes));
          } else {
            // Default fallback if no valid date
            console.warn('Data inválida para o agendamento:', appointment);
            startDate = new Date(); // Use current date as fallback
          }
          
          // Create end time (1 hour after start)
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          
          // Determine classes based on status and origin
          const classNames = [];
          
          // Add status class
          classNames.push(`status-${appointment.status || 'scheduled'}`);
          
          // Add origin class (with default if not specified)
          const origin = appointment.origin || 
            (appointment.serviceType === 'Vacinação' || appointment.serviceType === 'Check up inicial' ? 
             'automatic' : 'manual');
          
          classNames.push(origin === 'automatic' ? 'automatic-event' : 'manual-event');
          
          return {
            id: appointment.id,
            title: `${appointment.petName} - ${appointment.serviceType}`,
            start: startDate,
            end: endDate,
            classNames,
            extendedProps: {
              appointment: appointment
            }
          };
        });
        
        console.log('Eventos criados para o calendário:', events);
        this.calendarOptions = {
          ...this.calendarOptions,
          events: events
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos para o calendário:', err);
        this.error = 'Não foi possível carregar os agendamentos: ' + (err.message || 'Erro desconhecido');
        this.loading = false;
        this.showErrorSnackBar(this.error);
      }
    });
  }

  // Método para o botão "Novo Agendamento"
  createNewAppointment(): void {
    const today = new Date();
    this.openCreateDialog(today);
  }

  handleEventClick(clickInfo: any): void {
    const appointment = clickInfo.event.extendedProps.appointment;
    this.viewAppointmentDetails(appointment);
  }

  handleDateClick(dateClickInfo: any): void {
    const selectedDate = new Date(dateClickInfo.dateStr);
    
    // Verificar se a data é passada
    if (selectedDate < new Date()) {
      this.showErrorSnackBar('Não é possível criar agendamentos para datas passadas');
      return;
    }
    
    this.openCreateDialog(selectedDate);
  }

  viewAppointmentDetails(appointment: any): void {
    this.dialog.open(AppointmentDetailsDialog, {
      width: '500px',
      data: { appointment }
    });
  }

        openCreateDialog(date: Date): void {
      const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy');
      
      const dialogRef = this.dialog.open(AppointmentCreateDialog, {
        width: '500px',
        data: { preSelectedDate: formattedDate }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Calendar received from dialog:', result);
          
          // The service will handle the mapping from 'time' to 'hour'
          this.appointmentService.createAppointment(result).subscribe({
            next: () => {
              this.loadAppointments();
              this.showSuccessSnackBar('Agendamento criado com sucesso!');
            },
            error: (err) => {
              console.error('Error creating appointment:', err);
              console.error('Request data that caused error:', result);
              this.showErrorSnackBar(`Erro ao criar agendamento: ${err.message || 'Erro desconhecido'}`);
            }
          });
        }
      });
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