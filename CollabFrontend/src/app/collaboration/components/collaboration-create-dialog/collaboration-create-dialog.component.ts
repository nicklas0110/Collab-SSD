import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CollaborationService } from '../../services/collaboration.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-collaboration-create-dialog',
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
  templateUrl: './collaboration-create-dialog.component.html',
  styleUrls: ['./collaboration-create-dialog.component.css']
})
export class CollaborationCreateDialogComponent implements OnInit {
  form: FormGroup;
  currentUserId: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CollaborationCreateDialogComponent>,
    private collaborationService: CollaborationService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      participantIds: [[], Validators.required]
    });
  }

  ngOnInit() {
    // Get current user's ID and add it to participants
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.form.patchValue({
          participantIds: [user.id]
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.collaborationService.createCollaboration(this.form.value).subscribe({
        next: (collaboration) => {
          this.dialogRef.close(collaboration);
        },
        error: (error) => {
          console.error('Error creating collaboration:', error);
        }
      });
    }
  }
} 