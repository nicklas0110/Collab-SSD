import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../../auth/services/auth.service';
import { CollaborationService } from '../../../collaboration/services/collaboration.service';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.css',
  styles: [`
    .message-header {
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }

    .sender-name {
      font-weight: 500;
    }

    .own-message .message-header {
      text-align: right;
    }
  `]
})
export class MessageListComponent implements OnInit {
  collaborations$ = this.collaborationService.getCollaborations();
  selectedCollaboration: any = null;
  private selectedCollabId = new BehaviorSubject<string | null>(null);
  messages$ = this.selectedCollabId.pipe(
    switchMap(id => this.messageService.getMessages(id || undefined))
  );
  newMessage = '';
  currentUser$ = this.authService.currentUser$;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private collaborationService: CollaborationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const collaborationId = params['collaborationId'];
      if (collaborationId) {
        this.collaborationService.getCollaboration(collaborationId).subscribe(
          collab => this.selectCollaboration(collab)
        );
      }
    });
  }

  selectCollaboration(collaboration: any) {
    this.selectedCollaboration = collaboration;
    this.selectedCollabId.next(collaboration.id);
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedCollaboration) return;

    this.messageService.sendMessage({
      content: this.newMessage,
      collaborationId: this.selectedCollaboration.id,
      read: false
    }).subscribe(() => {
      this.newMessage = '';
      this.selectedCollabId.next(this.selectedCollaboration.id);
    });
  }
} 