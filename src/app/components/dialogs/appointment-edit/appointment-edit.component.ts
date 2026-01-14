import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-appointment-edit-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, MatDialogModule],
  providers: [DatePipe],
  templateUrl: './appointment-edit-dialog.component.html',
  styleUrls: ['./appointment-edit-dialog.component.css']
})
export class AppointmentEditDialog implements OnInit {
  appointmentForm: FormGroup;
  loading = false;
  error: string | null = null;
  today = new Date();
  
  serviceTypes = [
    { value: 'Consulta', label: 'Consulta Veterinária' },
    { value: 'Vacinação', label: 'Vacinação' },
    { value: 'Banho e Tosa', label: 'Banho e Tosa' },
    { value: 'Check-up Inicial', label: 'Check-up Inicial' },
    { value: 'Exames', label: 'Exames' }
  ];
  
  timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AppointmentEditDialog>,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: { appointment: any }
  ) {
    // Obter data em formato Date
    let appointmentDate: Date;
    if (typeof data.appointment.date === 'string') {
      if (data.appointment.date.includes('/')) {
        const [day, month, year] = data.appointment.date.split('/');
        appointmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        appointmentDate = new Date(data.appointment.date);
      }
    } else {
      appointmentDate = new Date(data.appointment.date);
    }

    this.appointmentForm = this.fb.group({
      id: [data.appointment.id],
      petId: [data.appointment.petId],
      petName: [data.appointment.petName],
      serviceType: [data.appointment.serviceType, Validators.required],
      date: [appointmentDate, Validators.required],
      time: [data.appointment.time, Validators.required],
      status: [data.appointment.status || 'scheduled']
    });
  }

  ngOnInit(): void {
    // Inicialização adicional se necessário
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    
    const formValues = this.appointmentForm.value;
    
    // Formatar a data para o formato dd/MM/yyyy
    const formattedDate = this.datePipe.transform(formValues.date, 'dd/MM/yyyy');
    
    const updatedAppointment = {
      ...formValues,
      date: formattedDate
    };

    this.dialogRef.close(updatedAppointment);
  }
}