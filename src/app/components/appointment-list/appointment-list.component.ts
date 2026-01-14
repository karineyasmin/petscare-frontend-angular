import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentService } from '../../services/appointment.service';
import { PetService } from '../../services/pet.service';
import { RouterLink } from '@angular/router';
import { AppointmentDetailsDialog } from '../dialogs/appointment-details-dialog/appointment-details-dialog.component';
import { AppointmentEditDialog } from '../dialogs/appointment-edit-dialog/appointment-edit-dialog.component';
import { ConfirmDialog } from '../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterLink
  ],
  providers: [DatePipe],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.css']
})
export class AppointmentListComponent implements OnInit {
  displayedColumns: string[] = ['date', 'time', 'petName', 'serviceType', 'status', 'origin', 'actions'];
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  pets: any[] = [];
  loading = false;
  error: string | null = null;
  filterText: string = '';
  
  constructor(
    private appointmentService: AppointmentService,
    private petService: PetService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    this.petService.getAllPets().subscribe({
      next: (pets) => {
        this.pets = pets;
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Erro ao carregar pets:', err);
        this.error = 'Não foi possível carregar a lista de pets. ' + err.message;
        this.loading = false;
      }
    });
  }

  
loadAppointments() {
  this.appointmentService.getAllAppointments().subscribe({
    next: (appointments) => {
      this.appointments = appointments.map(appointment => {
        // Processar a data para formato brasileiro (dd/MM/yyyy)
        let formattedDate = appointment.date;
        if (typeof appointment.date === 'string') {
          if (!appointment.date.includes('/')) {
            // Se for uma string no formato ISO
            const date = new Date(appointment.date);
            formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy');
          }
        } else if (appointment.date instanceof Date) {
          formattedDate = this.datePipe.transform(appointment.date, 'dd/MM/yyyy');
        }
        
        const pet = this.pets.find(p => p.id === appointment.petId);
        
        // Determinar a origem do agendamento - garantir valor padrão
        let origin = appointment.origin || '';
        // Se o valor não for válido (nem 'automatic' nem 'manual'), definir um padrão
        if (origin !== 'automatic' && origin !== 'manual') {
          // Agendamentos que têm serviços típicos de criação automática são provavelmente automáticos
          if (appointment.serviceType === 'Vacinação' || appointment.serviceType === 'Check-up Inicial') {
            origin = 'automatic';
          } else {
            origin = 'manual'; // Padrão para outros casos
          }
        }
        
        return {
          ...appointment,
          date: formattedDate,
          petName: pet ? pet.name : 'Pet não encontrado',
          status: appointment.status || 'scheduled',
          origin: origin // Garantir que a origem tenha um valor válido
        };
      });
      
      this.filteredAppointments = [...this.appointments];
      this.loading = false;
    },
    error: (err) => {
      console.error('Erro ao carregar agendamentos:', err);
      this.error = 'Não foi possível carregar os agendamentos. ' + err.message;
      this.loading = false;
    }
  });
}
    applyFilter() {
    if (!this.filterText) {
      this.filteredAppointments = [...this.appointments];
      return;
    }
    
    const filterValue = this.filterText.toLowerCase();
    this.filteredAppointments = this.appointments.filter(appointment => 
      appointment.petName?.toLowerCase().includes(filterValue) ||
      appointment.serviceType?.toLowerCase().includes(filterValue) ||
      appointment.date?.toLowerCase().includes(filterValue) ||
      appointment.time?.toLowerCase().includes(filterValue) ||
      this.getStatusLabel(appointment.status)?.toLowerCase().includes(filterValue) ||
      this.getOriginLabel(appointment.origin)?.toLowerCase().includes(filterValue)  // Adicione esta linha
    );
  }

  viewAppointmentDetails(appointment: any) {
    this.dialog.open(AppointmentDetailsDialog, {
      width: '500px',
      data: { appointment }
    });
  }

    editAppointment(appointment: any) {
    const dialogRef = this.dialog.open(AppointmentEditDialog, {
      width: '500px',
      data: { appointment }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        
        // Usar o novo método de atualização parcial
        this.appointmentService.updateAppointmentPartial(appointment.id, {
          serviceType: result.serviceType,
          date: result.date,
          time: result.time
        }).subscribe({
          next: () => {
            const index = this.appointments.findIndex(a => a.id === appointment.id);
            if (index !== -1) {
              // Atualizar localmente apenas os campos modificados
              this.appointments[index].serviceType = result.serviceType;
              this.appointments[index].date = typeof result.date === 'string' ? 
                result.date : 
                this.datePipe.transform(result.date, 'dd/MM/yyyy');
              this.appointments[index].time = result.time;
              
              this.applyFilter();
            }
            
            this.loading = false;
            this.showSuccessSnackBar('Agendamento atualizado com sucesso!');
          },
          error: (err) => {
            console.error('Erro ao atualizar agendamento:', err);
            this.loading = false;
            this.showErrorSnackBar(`Erro ao atualizar agendamento: ${err.message}`);
          }
        });
      }
    });
  }

  completeAppointment(appointment: any) {
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

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;
        
        // Usar o método específico para atualização de status
        this.appointmentService.updateAppointmentStatus(appointment.id, 'completed').subscribe({
          next: () => {
            const index = this.appointments.findIndex(a => a.id === appointment.id);
            if (index !== -1) {
              this.appointments[index].status = 'completed';
              this.applyFilter();
            }
            
            this.loading = false;
            this.showSuccessSnackBar('Agendamento marcado como concluído!');
          },
          error: (err) => {
            console.error('Erro ao concluir agendamento:', err);
            this.loading = false;
            this.showErrorSnackBar(`Erro ao concluir agendamento: ${err.message}`);
          }
        });
      }
    });
  }

  cancelAppointment(appointment: any) {
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

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;
        
        // Usar o método específico para atualização de status
        this.appointmentService.updateAppointmentStatus(appointment.id, 'canceled').subscribe({
          next: () => {
            const index = this.appointments.findIndex(a => a.id === appointment.id);
            if (index !== -1) {
              this.appointments[index].status = 'canceled';
              this.applyFilter();
            }
            
            this.loading = false;
            this.showSuccessSnackBar('Agendamento cancelado com sucesso!');
          },
          error: (err) => {
            console.error('Erro ao cancelar agendamento:', err);
            this.loading = false;
            this.showErrorSnackBar(`Erro ao cancelar agendamento: ${err.message}`);
          }
        });
      }
    });
  }

  private showSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
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
  
  getStatusClass(status: string): string {
    if (!status) return '';
    
    switch (status.toLowerCase()) { // Adicionado toLowerCase() aqui
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'canceled': return 'status-canceled';
      default: return '';
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
  getOriginIcon(origin: string): string {
    switch (origin) {
      case 'automatic': return 'auto_awesome';
      case 'manual': return 'person';
      default: return 'help_outline';
    }
  }
  
  getOriginLabel(origin: string): string {
    switch (origin) {
      case 'automatic': return 'Automático';
      case 'manual': return 'Manual';
      default: return 'Desconhecido';
      }
  }
}  