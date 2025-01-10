import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CollaborationService } from '../../services/collaboration.service';

type CollaborationStatus = 'active' | 'completed' | 'cancelled';

@Component({
  selector: 'app-collaboration-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Collaboration</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" required>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" required>
            <mat-option *ngFor="let status of statusOptions" [value]="status">
              {{status | titlecase}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">Update</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    mat-dialog-content {
      min-width: 400px;
    }
    
    form {
      display: flex;
      flex-direction: column;
    }
    
    mat-dialog-actions {
      padding: 16px;
    }
  `]
})
export class CollaborationEditDialogComponent implements OnInit {
  form: FormGroup;
  statusOptions: CollaborationStatus[] = ['active', 'completed', 'cancelled'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CollaborationEditDialogComponent>,
    private collaborationService: CollaborationService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.form.patchValue({
      title: this.data.title,
      description: this.data.description,
      status: this.data.status
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const updatedCollaboration = {
        ...this.data,
        title: this.form.value.title,
        description: this.form.value.description,
        status: this.form.value.status
      };

      this.collaborationService.updateCollaboration(this.data.id, updatedCollaboration).subscribe({
        next: (collaboration) => {
          this.dialogRef.close(collaboration);
        },
        error: (error) => {
          console.error('Error updating collaboration:', error);
        }
      });
    }
  }
} 