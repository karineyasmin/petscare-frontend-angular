import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { MatDialog } from '@angular/material/dialog';
import { PetService } from '../../services/pet.service';
import { ConfirmDeleteDialog } from '../dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { DeleteConfirmationDialog } from '../dialogs/delete-confirmation/delete-confirmation-dialog.component';
import { PetDetailsDialog } from '../dialogs/pet-details/pet-details-dialog.component';
import { PetEditDialog } from '../dialogs/pet-edit/pet-edit-dialog.component';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MaterialModule,
    DeleteConfirmationDialog,
    PetDetailsDialog,
    PetEditDialog,
    ConfirmDeleteDialog
  ],
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.css']
})
export class PetListComponent implements OnInit {
  pets: any[] = [];
  filteredPets: any[] = [];
  loading = true;
  error: string | null = null;
  filterText = '';
  displayedColumns: string[] = ['name', 'species', 'breed', 'age', 'weight', 'owner', 'actions'];
  selectedPet: any = null;
  submitting = false;
  
  constructor(
    private petService: PetService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    this.loading = true;
    this.error = null;
    
    this.petService.getAllPets().subscribe({
      next: (pets) => {
        this.pets = pets;
        this.filteredPets = [...this.pets];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar os pets:', err);
        this.error = 'Não foi possível carregar a lista de pets. ' + err.message;
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.filterText.trim()) {
      this.filteredPets = [...this.pets];
      return;
    }

    const searchTerm = this.filterText.toLowerCase().trim();
    this.filteredPets = this.pets.filter(pet => 
      pet.name?.toLowerCase().includes(searchTerm) || 
      pet.species?.toLowerCase().includes(searchTerm) || 
      pet.breed?.toLowerCase().includes(searchTerm) ||
      pet.ownerName?.toLowerCase().includes(searchTerm)
    );
  }

  confirmDelete(pet: any): void {
    this.selectedPet = pet;
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '500px',
      data: { pet }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletePet();
      }
    });
  }

  deletePet(): void {
    if (this.selectedPet && this.selectedPet.id) {
      this.petService.deletePet(this.selectedPet.id).subscribe({
        next: () => {
          this.pets = this.pets.filter(p => p.id !== this.selectedPet.id);
          this.filteredPets = this.filteredPets.filter(p => p.id !== this.selectedPet.id);
          this.selectedPet = null;
        },
        error: (err) => {
          console.error('Erro ao excluir pet:', err);
          this.error = 'Erro ao excluir o pet: ' + err.message;
        }
      });
    }
  }

  viewPetDetails(pet: any): void {
    this.selectedPet = pet;
    
    const dialogRef = this.dialog.open(PetDetailsDialog, {
      width: '800px',
      data: { pet: pet }
    });
  }

  editPet(pet: any): void {
    this.selectedPet = pet;
    const editFormValue = {
      name: pet.name,
      age: pet.age,
      sex: pet.sex,
      weight: pet.weight,
      ownerName: pet.ownerName,
      ownerEmail: pet.ownerEmail
    };
    
    const dialogRef = this.dialog.open(PetEditDialog, {
      width: '500px',
      data: { 
        pet: pet,
        formValue: editFormValue
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePet(pet.id, result);
      }
    });
  }

  updatePet(id: string, updatedData: any): void {
    this.submitting = true;
    
    this.petService.updatePet(id, updatedData).subscribe({
      next: () => {
        const index = this.pets.findIndex(p => p.id === id);
        if (index !== -1) {
          this.pets[index] = { 
            ...this.pets[index],
            ...updatedData 
          };
          this.applyFilter();
        }
        this.submitting = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Erro ao atualizar pet:', err);
        this.error = 'Erro ao atualizar o pet: ' + err.message;
        this.submitting = false;
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}