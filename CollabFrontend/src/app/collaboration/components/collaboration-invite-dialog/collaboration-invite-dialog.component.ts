import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../shared/services/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-collaboration-invite-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatSelectionList
  ],
  template: `
    <h2 mat-dialog-title>Invite Users</h2>
    <mat-dialog-content>
      @if ((users$ | async)?.length) {
        <mat-selection-list #userList>
          @for (user of users$ | async; track user.id) {
            <mat-list-option [value]="user.id">
              {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
            </mat-list-option>
          }
        </mat-selection-list>
      } @else {
        <div class="empty-state">
          <mat-icon>person_off</mat-icon>
          <p>No users available to invite</p>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      @if ((users$ | async)?.length) {
        <button mat-raised-button color="primary" 
                (click)="inviteUsers(userList.selectedOptions.selected)">
          Invite Selected
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: rgba(0, 0, 0, 0.54);
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }
  `]
})
export class CollaborationInviteDialogComponent implements OnInit {
  @ViewChild('userList') userList!: MatSelectionList;
  users$: Observable<User[]>;
  currentUserId: string;
  collaborationId: string;

  constructor(
    private dialogRef: MatDialogRef<CollaborationInviteDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.currentUserId = data.currentUserId;
    this.collaborationId = data.collaborationId;
    
    this.users$ = this.userService.getUsers().pipe(
      map(users => users.filter(u => 
        u.id !== this.currentUserId && 
        !data.participants.some((p: any) => p.id === u.id)
      ))
    );
  }

  ngOnInit() {}

  inviteUsers(selectedOptions: any[]) {
    const selectedUserIds = selectedOptions.map(option => option.value);
    this.dialogRef.close(selectedUserIds);
  }
} 