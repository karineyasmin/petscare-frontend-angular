import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module'; // Corrigido o caminho

@Component({
  selector: 'app-pet-details-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './pet-details-dialog.component.html',
  styleUrls: ['./pet-details-dialog.component.css']
})
export class PetDetailsDialog {
  constructor(
    public dialogRef: MatDialogRef<PetDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}