import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { NotificationFilter } from '../../models/notification.model';
import { PetService } from '../../services/pet.service';

@Component({
  selector: 'app-notification-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './notification-filter.component.html',
  styleUrls: ['./notification-filter.component.css']
})
export class NotificationFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<NotificationFilter>();
  @Input() loading = false;

  filterForm: FormGroup;
  pets: any[] = [];
  
  notificationTypes = [
    { value: 'appointment_confirmation', label: 'Confirmação de Agendamento' },
    { value: 'appointment_reminder', label: 'Lembrete de Agendamento' },
    { value: 'appointment_canceled', label: 'Agendamento Cancelado' },
    { value: 'appointment_completed', label: 'Agendamento Concluído' }
  ];
  
  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'sent', label: 'Enviado' },
    { value: 'pending', label: 'Pendente' },
    { value: 'failed', label: 'Falhou' }
  ];

  constructor(
    private fb: FormBuilder,
    private petService: PetService
  ) {
    this.filterForm = this.fb.group({
      petId: [''],
      type: [''],
      status: ['all'],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  ngOnInit(): void {
    this.loadPets();
    
    // Emitir filtros iniciais
    this.applyFilters();
    
    // Atualizar filtros quando o formulário mudar
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadPets(): void {
    this.petService.getAllPets().subscribe({
      next: (pets) => {
        this.pets = pets;
      },
      error: (error) => {
        console.error('Erro ao carregar pets:', error);
      }
    });
  }

  applyFilters(): void {
    const formValues = this.filterForm.value;
    
    const filter: NotificationFilter = {
      petId: formValues.petId || undefined,
      type: formValues.type || undefined,
      status: formValues.status || 'all',
      startDate: formValues.dateRange?.start || undefined,
      endDate: formValues.dateRange?.end || undefined
    };
    
    this.filterChange.emit(filter);
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: 'all',
      dateRange: {
        start: '',
        end: ''
      }
    });
    this.applyFilters();
  }
}