import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { MaterialModule } from '../../material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentEditDialog } from '../dialogs/appointment-edit-dialog/appointment-edit-dialog.component';
import { AppointmentCreateDialog } from '../dialogs/appointment-create-dialog/appointment-create-dialog.component';
import { ConfirmDialog } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { AppointmentDetailsDialog } from '../dialogs/appointment-details-dialog/appointment-details-dialog.component';

@Component({
  selector: 'app-appointment-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MaterialModule, 
    RouterModule
  ],
  providers: [DatePipe],
  templateUrl: './appointment-dashboard.component.html',
  styleUrls: ['./appointment-dashboard.component.css']
})
export class AppointmentDashboardComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  todayAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];
  
  totalAppointments: number = 0;
  scheduledAppointments: number = 0;
  completedAppointments: number = 0;
  canceledAppointments: number = 0;
  
  loading = false;
  error: string | null = null;
  filterStatus = 'all';
  filterDate = '';
  sortBy = 'date';
  sortDirection = 'asc';

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        console.log('Agendamentos carregados:', data);
        this.appointments = data.map(appointment => {
          // Converter a string de data em um objeto Date para ordenação
          let dateObj = new Date(appointment.date);
          if (isNaN(dateObj.getTime())) {
            // Se a data estiver em um formato diferente, tentar converter
            const parts = appointment.date.split('/');
            if (parts.length === 3) {
              // Formato dd/MM/yyyy
              dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          }
          
          // Adicionar data formatada
          const formattedDate = this.datePipe.transform(dateObj, 'dd/MM/yyyy');
          
          return {
            ...appointment,
            dateObj: dateObj,
            formattedDate: formattedDate
          };
        });
        
        // Processar os agendamentos para as diferentes seções
        this.processAppointments();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos:', err);
        this.error = 'Erro ao carregar agendamentos: ' + (err.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
  }
  
  processAppointments(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Contadores
    this.totalAppointments = this.appointments.length;
    this.scheduledAppointments = this.appointments.filter(a => a.status === 'scheduled').length;
    this.completedAppointments = this.appointments.filter(a => a.status === 'completed').length;
    this.canceledAppointments = this.appointments.filter(a => a.status === 'canceled').length;
    
    // Agendamentos de hoje (apenas os agendados)
    this.todayAppointments = this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateObj);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate.getTime() === today.getTime() && appointment.status === 'scheduled';
    }).sort((a, b) => a.time.localeCompare(b.time));
    
    // Próximos agendamentos (futuros e agendados)
    this.upcomingAppointments = this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateObj);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate.getTime() > today.getTime() && appointment.status === 'scheduled';
    }).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    // Agendamentos passados (já ocorridos ou cancelados/concluídos)
    this.pastAppointments = this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateObj);
      appointmentDate.setHours(0, 0, 0, 0);
      const isCompleted = appointment.status === 'completed';
      const isCanceled = appointment.status === 'canceled';
      const isPast = appointmentDate.getTime() < today.getTime();
      return isCompleted || isCanceled || isPast;
    }).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()); // Ordem decrescente
  }

  applyFilter(): void {
    let filtered = [...this.appointments];
    
    // Filtrar por status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === this.filterStatus);
    }
    
    // Filtrar por data
    if (this.filterDate) {
      const filterDateStr = this.datePipe.transform(new Date(this.filterDate), 'dd/MM/yyyy');
      filtered = filtered.filter(appointment => {
        const appointmentDateStr = this.datePipe.transform(appointment.dateObj, 'dd/MM/yyyy');
        return appointmentDateStr === filterDateStr;
      });
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (this.sortBy === 'date') {
        comparison = a.dateObj.getTime() - b.dateObj.getTime();
      } else if (this.sortBy === 'petName') {
        comparison = a.petName.localeCompare(b.petName);
      } else if (this.sortBy === 'serviceType') {
        comparison = a.serviceType.localeCompare(b.serviceType);
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    this.filteredAppointments = filtered;
  }

  resetFilters(): void {
    this.filterStatus = 'all';
    this.filterDate = '';
    this.applyFilter();
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.applyFilter();
  }

  createAppointment(): void {
    const dialogRef = this.dialog.open(AppointmentCreateDialog, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        
        console.log('Criando novo agendamento:', result);
        
        this.appointmentService.createAppointment(result).subscribe({
          next: () => {
            this.loadData(); // Recarrega todos os dados
            this.loading = false;
            this.showSuccessSnackBar('Agendamento criado com sucesso!');
          },
          error: (err) => {
            console.error('Erro ao criar agendamento:', err);
            
            // Log detalhado para depuração
            if (err.error) {
              console.error('Detalhes do erro:', err.error);
            }
            
            this.error = `Erro ao criar agendamento: ${err.message || 'Erro desconhecido'}`;
            this.loading = false;
            this.showErrorSnackBar(this.error);
          }
        });
      }
    });
  }

  viewAppointmentDetails(appointment: any): void {
    this.dialog.open(AppointmentDetailsDialog, {
      width: '500px',
      data: { appointment }
    });
  }

  rescheduleAppointment(appointment: any): void {
    const dialogRef = this.dialog.open(AppointmentEditDialog, {
      width: '500px',
      data: { appointment }
    });
  
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loading = true;
        
        // Usar o método de atualização parcial
        this.appointmentService.updateAppointmentPartial(appointment.id, {
          serviceType: result.serviceType,
          date: result.date,
          time: result.time
        }).subscribe({
          next: () => {
            this.loadData(); // Recarregar todos os dados
            this.loading = false;
            this.showSuccessSnackBar('Agendamento remarcado com sucesso!');
          },
          error: (err: any) => {
            console.error('Erro ao remarcar agendamento:', err);
            
            // Log detalhado para depuração
            if (err.error) {
              console.error('Detalhes do erro:', err.error);
            }
            
            this.error = 'Erro ao remarcar agendamento: ' + err.message;
            this.loading = false;
            this.showErrorSnackBar('Erro ao remarcar agendamento: ' + err.message);
          }
        });
      }
    });
  }
  
  cancelAppointment(appointment: any): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Cancelar Agendamento',
        message: `Deseja realmente cancelar o agendamento de ${appointment.petName}?`,
        confirmText: 'Cancelar Agendamento',
        cancelText: 'Voltar',
        color: 'warn',
        icon: 'cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: any) => {
      if (confirmed) {
        this.loading = true;
        
        // Usar o método específico para atualização de status
        this.appointmentService.updateAppointmentStatus(appointment.id, 'canceled').subscribe({
          next: (response) => {
            console.log('Agendamento cancelado com sucesso:', response);
            this.loadData(); // Recarrega todos os dados
            this.loading = false;
            this.showSuccessSnackBar('Agendamento cancelado com sucesso!');
          },
          error: (err: any) => {
            console.error('Erro ao cancelar agendamento:', err);
            this.error = `Erro ao cancelar agendamento: ${err.message || 'Erro desconhecido'}`;
            this.loading = false;
            this.showErrorSnackBar(this.error);
          }
        });
      }
    });
  }

  completeAppointment(appointment: any): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Concluir Agendamento',
        message: `Deseja marcar o agendamento de ${appointment.petName} como concluído?`,
        confirmText: 'Concluir',
        cancelText: 'Cancelar',
        color: 'primary',
        icon: 'check_circle'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: any) => {
      if (confirmed) {
        this.loading = true;
        
        // Usar o método específico para atualização de status
        this.appointmentService.updateAppointmentStatus(appointment.id, 'completed').subscribe({
          next: (response) => {
            console.log('Agendamento concluído com sucesso:', response);
            this.loadData(); // Recarrega todos os dados
            this.loading = false;
            this.showSuccessSnackBar('Agendamento concluído com sucesso!');
          },
          error: (err: any) => {
            console.error('Erro ao concluir agendamento:', err);
            this.error = `Erro ao concluir agendamento: ${err.message || 'Erro desconhecido'}`;
            this.loading = false;
            this.showErrorSnackBar(this.error);
          }
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'canceled': return 'status-canceled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'canceled': return 'Cancelado';
      default: return status;
    }
  }
  
  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'canceled': return 'Cancelado';
      default: return status;
    }
  }

  getDay(dateString: string | Date): string {
    if (!dateString) return '';
    
    // Se a data já for um objeto Date, usá-lo diretamente
    if (dateString instanceof Date) {
      return dateString.getDate().toString().padStart(2, '0');
    }
    
    // Se o formato for dd/mm/yyyy
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        return parts[0].padStart(2, '0');
      }
    }
    
    // Tentar converter para data
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.getDate().toString().padStart(2, '0');
    }
    
    return '';
  }
  
  // Fix the type error in getMonth method
  getMonth(dateString: string | Date): string {
    if (!dateString) return '';
    
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Se a data já for um objeto Date, usá-lo diretamente
    if (dateString instanceof Date) {
      return meses[dateString.getMonth()];
    }
    
    // Se o formato for dd/mm/yyyy
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10) - 1; // Mês começa em 0
        return meses[month];
      }
    }
    
    // Tentar converter para data
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return meses[date.getMonth()];
    }
    
    return '';
  }

  // Método para confirmação de cancelamento no template
  confirmCancel(appointment: any): void {
    this.cancelAppointment(appointment);
  }

  showSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  showErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}