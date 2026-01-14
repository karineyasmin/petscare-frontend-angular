import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { PetService } from '../../../services/pet.service';

@Component({
  selector: 'app-appointment-create-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, MatDialogModule],
  providers: [DatePipe],
  templateUrl: './appointment-create-dialog.component.html',
  styleUrls: ['./appointment-create-dialog.component.css']
})
export class AppointmentCreateDialog implements OnInit {
  appointmentForm: FormGroup;
  loading = false;
  error: string | null = null;
  today = new Date();
  pets: any[] = [];
  selectedPet: any = null;
  
  serviceTypes = [
    { value: 'Consulta', label: 'Consulta Veterinária' },
    { value: 'Vacinação', label: 'Vacinação' },
    { value: 'Banho e Tosa', label: 'Banho e Tosa' },
    { value: 'Check-up Inicial', label: 'Check-up Inicial' },
    { value: 'Castração', label: 'Castração' },
    { value: 'Exames', label: 'Exames' }

  ];
  
  timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AppointmentCreateDialog>,
    private datePipe: DatePipe,
    private petService: PetService
  ) {
    this.appointmentForm = this.fb.group({
      petId: ['', Validators.required],
      serviceType: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    this.loading = true;
    this.petService.getAllPets().subscribe({
      next: (pets) => {
        this.pets = pets;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar pets:', err);
        this.error = 'Não foi possível carregar a lista de pets. ' + err.message;
        this.loading = false;
      }
    });
  }

  onPetSelect(petId: string): void {
    this.selectedPet = this.pets.find(pet => pet.id === petId);
    console.log('Pet selecionado:', this.selectedPet);
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid || !this.selectedPet) {
      console.log('Formulário inválido ou pet não selecionado', this.appointmentForm.value);
      return;
    }

    this.loading = true;
    this.error = null;
    
    const formValues = this.appointmentForm.value;
    console.log('Valores do formulário:', formValues);
    
    // Formatar a data para o formato dd/MM/yyyy
    const formattedDate = this.datePipe.transform(formValues.date, 'dd/MM/yyyy');
    
    const newAppointment = {
      petId: formValues.petId,
      petName: this.selectedPet.name,
      ownerName: this.selectedPet.ownerName,
      ownerEmail: this.selectedPet.ownerEmail || '',
      serviceType: formValues.serviceType,
      date: formattedDate,
      time: formValues.time,
      status: 'scheduled'
    };
    
    console.log('Enviando novo agendamento:', newAppointment);
    this.dialogRef.close(newAppointment);
  }
}