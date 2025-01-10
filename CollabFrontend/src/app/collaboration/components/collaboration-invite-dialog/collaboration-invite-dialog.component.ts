import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../shared/services/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-collaboration-invite-dialog',
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
  templateUrl: './collaboration-invite-dialog.component.html',
  styleUrls: ['./collaboration-invite-dialog.component.css']
})
export class CollaborationInviteDialogComponent implements OnInit {
  form: FormGroup;
  users$: Observable<User[]>;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { collaborationId: string, currentParticipants: User[] },
    private dialogRef: MatDialogRef<CollaborationInviteDialogComponent>
  ) {
    this.form = this.fb.group({
      userId: ['', Validators.required]
    });

    this.users$ = this.userService.getUsers().pipe(
      map(users => users.filter(user => 
        !this.data.currentParticipants.some(participant => participant.id === user.id)
      ))
    );
  }

  ngOnInit() {}

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.get('userId')?.value);
    }
  }
} 