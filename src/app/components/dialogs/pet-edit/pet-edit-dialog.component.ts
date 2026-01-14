import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module'; // Corrigido o caminho

@Component({
  selector: 'app-pet-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './pet-edit-dialog.component.html',
  styleUrls: ['./pet-edit-dialog.component.css']
})
export class PetEditDialog implements OnInit {
  editForm: FormGroup;
  
  constructor(
    public dialogRef: MatDialogRef<PetEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      age: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
      sex: ['male', [Validators.required]],
      weight: [0, [Validators.required, Validators.min(0.1), Validators.max(100)]],
      ownerName: ['', [Validators.required]],
      ownerEmail: ['', [Validators.required, Validators.email]]
    });
  }
  
  ngOnInit() {
    if (this.data?.formValue) {
      this.editForm.setValue(this.data.formValue);
    }
  }
}