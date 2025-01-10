import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ValidatorService } from '../../../shared/services/validator.service';

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
  templateUrl: './collaboration-edit-dialog.component.html',
  styleUrls: ['./collaboration-edit-dialog.component.css']
})
export class CollaborationEditDialogComponent implements OnInit {
  form: FormGroup;
  statusOptions = ['active', 'completed', 'cancelled'];

  constructor(
    private fb: FormBuilder,
    private validatorService: ValidatorService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CollaborationEditDialogComponent>
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
      ]],
      status: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.form.patchValue({
        title: this.data.title,
        description: this.data.description,
        status: this.data.status
      });
    }
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

      this.dialogRef.close({
        ...this.data,
        title: sanitizedTitle,
        description: sanitizedDescription,
        status: formValue.status
      });
    }
  }
} 