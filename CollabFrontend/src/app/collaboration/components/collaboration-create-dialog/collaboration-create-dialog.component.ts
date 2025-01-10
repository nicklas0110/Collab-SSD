import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ValidatorService } from '../../../shared/services/validator.service';
import { AuthService } from '../../../auth/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-collaboration-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './collaboration-create-dialog.component.html',
  styleUrls: ['./collaboration-create-dialog.component.css']
})
export class CollaborationCreateDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validatorService: ValidatorService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<CollaborationCreateDialogComponent>
  ) {
    this.form = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9\\s\\-_]{3,100}$'),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.pattern('^[\\w\\s\\-_.,!?()]{0,500}$'),
        Validators.maxLength(500)
      ]]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      
      const sanitizedTitle = this.validatorService.sanitizeInput(formValue.title || '');
      const sanitizedDescription = this.validatorService.sanitizeInput(formValue.description || '');

      if (!this.validatorService.validateTitle(sanitizedTitle)) {
        return;
      }

      if (sanitizedDescription && !this.validatorService.validateDescription(sanitizedDescription)) {
        return;
      }

      // Get current user's ID
      this.authService.currentUser$.pipe(
        take(1)
      ).subscribe(user => {
        if (user) {
          this.dialogRef.close({
            title: sanitizedTitle,
            description: sanitizedDescription,
            status: 'active',
            participantIds: [user.id] // Include current user as participant
          });
        }
      });
    }
  }
} 