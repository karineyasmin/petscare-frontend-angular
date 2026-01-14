import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

// Importe apenas o componente de detalhes do pet
import { PetDetailsDialog } from '../pet-details/pet-details-dialog.component';

interface Pet {
  id: string;
  name: string;
  species: string;
  breedId: string;
  breed?: string;
  ownerName: string;
  ownerEmail?: string;
  age?: number;
  weight?: number;
  sex?: string;
}

@Component({
  selector: 'app-pet-success-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './pet-success-dialog.component.html',
  styleUrls: ['./pet-success-dialog.component.css']
})
export class PetSuccessDialog {
  constructor(
    public dialogRef: MatDialogRef<PetSuccessDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { pet: Pet },
    private router: Router,
    private dialog: MatDialog
  ) {
    console.log('PetSuccessDialog inicializado com pet:', data?.pet);
  }

  viewPet(): void {
    // Feche o diálogo atual
    this.dialogRef.close();
    
    // Abra o diálogo de detalhes do pet
    try {
      this.dialog.open(PetDetailsDialog, {
        width: '650px',
        data: { 
          pet: this.data.pet,
          isReadOnly: true
        },
        panelClass: 'pet-details-dialog-panel'
      });
    } catch (error) {
      console.error('Erro ao abrir diálogo de detalhes:', error);
      // Se falhar, redirecione para a lista
      this.router.navigate(['/pet-list']);
    }
  }

  navigateToList(): void {
    this.dialogRef.close();
    this.router.navigate(['/pet-list']);
  }

  createNewPet(): void {
    this.dialogRef.close();
    
    // Redirecione para a página de cadastro com um delay para evitar problemas
    setTimeout(() => {
      this.router.navigateByUrl('/pet-registration');
    }, 100);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}