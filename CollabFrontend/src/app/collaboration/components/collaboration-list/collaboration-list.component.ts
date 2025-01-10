import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatDialogModule,
    MatTooltipModule
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
        this.collaborationService.createCollaboration(result)
          .subscribe({
            next: () => {
              this.collaborations$ = this.collaborationService.getCollaborations();
            },
            error: (error) => {
              console.error('Error creating collaboration:', error);
            }
          });
      }
    });
  }

  deleteCollaboration(collab: any, event: Event) {
    event.stopPropagation();  // Prevent card click event
    if (confirm('Are you sure you want to delete this collaboration?')) {
      this.collaborationService.deleteCollaboration(collab.id)
        .subscribe(() => {
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

  openInviteDialog(collab: any) {
    const dialogRef = this.dialog.open(CollaborationInviteDialogComponent, {
      data: { 
        collaborationId: collab.id,
        currentParticipants: collab.participants 
      }
    });

    dialogRef.afterClosed().subscribe(userId => {
      if (userId) {
        this.collaborationService.addParticipant(collab.id, userId)
          .subscribe(() => {
            this.collaborations$ = this.collaborationService.getCollaborations();
          });
      }
    });
  }

  getParticipantsList(participants: any[]): string {
    return participants
      .map(p => `${p.firstName} ${p.lastName}`)
      .join(', ');
  }

  getAllParticipants(participants: any[]): string {
    return `All Participants:\n${participants
      .map(p => `${p.firstName} ${p.lastName}`)
      .join('\n')}`;
  }

  openEditDialog(collab: any) {
    const dialogRef = this.dialog.open(CollaborationEditDialogComponent, {
      data: collab
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.collaborationService.updateCollaboration(collab.id, result)
          .subscribe(() => {
            this.collaborations$ = this.collaborationService.getCollaborations();
          });
      }
    });
  }
} 