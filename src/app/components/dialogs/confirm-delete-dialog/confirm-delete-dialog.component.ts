import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.css']
})
export class ConfirmDeleteDialog {
  confirmForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ConfirmDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { pet: any }
  ) {
    this.confirmForm = this.fb.group({
      confirmation: ['', [Validators.required, this.matchPetName.bind(this)]]
    });
  }

  matchPetName(control: any) {
    const enteredName = control.value;
    const petName = this.data.pet?.name;
    
    if (enteredName !== petName) {
      return { nameNotMatching: true };
    }
    return null;
  }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    if (this.confirmForm.valid) {
      this.dialogRef.close(true);
    }
  }
}