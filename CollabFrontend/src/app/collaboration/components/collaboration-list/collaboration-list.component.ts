import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CollaborationService } from '../../services/collaboration.service';
import { CollaborationCreateDialogComponent } from '../collaboration-create-dialog/collaboration-create-dialog.component';
import { CollaborationEditDialogComponent } from '../collaboration-edit-dialog/collaboration-edit-dialog.component';
import { AuthService } from '../../../auth/services/auth.service';
import { CollaborationInviteDialogComponent } from '../collaboration-invite-dialog/collaboration-invite-dialog.component';
import { forkJoin } from 'rxjs';
import { UserService } from '../../../shared/services/user.service';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-collaboration-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './collaboration-list.component.html',
  styleUrl: './collaboration-list.component.css'
})
export class CollaborationListComponent implements OnInit {
  collaborations$ = this.collaborationService.getCollaborations();
  currentUserId: string | null = null;

  constructor(
    private collaborationService: CollaborationService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUserId = user?.id || null;
    });
  }

  goToMessages(collaborationId: string) {
    this.router.navigate(['/messages'], { queryParams: { collaborationId } });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'accent';
      case 'cancelled':
        return 'warn';
      default:
        return '';
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CollaborationCreateDialogComponent);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.collaborations$ = this.collaborationService.getCollaborations();
      }
    });
  }

  deleteCollaboration(id: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this collaboration?')) {
      this.collaborationService.deleteCollaboration(id).subscribe(() => {
        this.collaborations$ = this.collaborationService.getCollaborations();
      });
    }
  }

  editCollaboration(collab: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(CollaborationEditDialogComponent, {
      data: collab
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.collaborations$ = this.collaborationService.getCollaborations();
      }
    });
  }

  inviteParticipant(collab: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(CollaborationInviteDialogComponent, {
      data: {
        collaborationId: collab.id,
        currentUserId: this.currentUserId,
        participants: collab.participants
      }
    });

    dialogRef.afterClosed().subscribe(userIds => {
      if (userIds) {
        const invites = userIds.map((userId: string) => 
          this.collaborationService.addParticipant(collab.id, userId)
        );
        
        forkJoin(invites).subscribe(() => {
          this.collaborations$ = this.collaborationService.getCollaborations();
        });
      }
    });
  }
} 