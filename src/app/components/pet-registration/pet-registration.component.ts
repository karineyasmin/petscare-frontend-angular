import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { PetService } from '../../services/pet.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PetSuccessDialog } from '../dialogs/pet-success-dialog/pet-success-dialog.component';
import { PetDetailsDialog } from '../dialogs/pet-details/pet-details-dialog.component';
import { PetEditDialog } from '../dialogs/pet-edit/pet-edit-dialog.component';

@Component({
  selector: 'app-pet-registration',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MaterialModule, 
    RouterLink,
    MatDialogModule,
    PetSuccessDialog,
    PetDetailsDialog,
    PetEditDialog
  ],
  templateUrl: './pet-registration.component.html',
  styleUrls: ['./pet-registration.component.css']
})
export class PetRegistrationComponent implements OnInit {
  petForm: FormGroup;
  loading = false;
  success: string | null = null;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private petService: PetService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      species: ['', Validators.required],
      breedId: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0), Validators.max(30)]],
      sex: ['male', Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1), Validators.max(100)]],
      owner: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Código de inicialização, se necessário
  }

  onSubmit(): void {
    this.success = null;
    this.error = null;

    if (this.petForm.valid) {
      this.loading = true;

      const pet = {
        name: this.petForm.value.name,
        species: this.petForm.value.species,
        breedId: this.petForm.value.breedId,
        age: this.petForm.value.age,
        sex: this.petForm.value.sex,
        weight: this.petForm.value.weight,
        ownerName: this.petForm.value.owner,
        ownerEmail: this.petForm.value.email
      };

      this.petService.registerPet(pet).subscribe({
        next: (response) => {
          console.log('Pet cadastrado com sucesso:', response);
          this.loading = false;
          
          // Abrir o diálogo de sucesso com os dados do pet
          this.dialog.open(PetSuccessDialog, {
            width: '400px',
            data: { pet: response },
            disableClose: false,
            autoFocus: false,
            panelClass: 'pet-success-panel' 
          });
          
          // Limpar formulário
          this.petForm.reset({
            sex: 'male'
          });
        },
        error: (error) => {
          console.error('Erro ao registrar pet:', error);
          this.error = 'Erro ao cadastrar pet: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      this.validateAllFormFields(this.petForm);
      console.log('Formulário inválido', this.petForm.errors);
    }
  }

  validateAllFormFields(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}