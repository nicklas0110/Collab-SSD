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
import { ActivatedRoute, Params } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../../auth/services/auth.service';
import { CollaborationService } from '../../../collaboration/services/collaboration.service';
import { BehaviorSubject, filter, switchMap, take } from 'rxjs';
import { Message } from '../../interfaces/message.interface';
import { ValidatorService } from '../../../shared/services/validator.service';

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
  messages$ = new BehaviorSubject<Message[]>([]);
  newMessage = '';
  currentUser$ = this.authService.currentUser$;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private collaborationService: CollaborationService,
    private route: ActivatedRoute,
    private validatorService: ValidatorService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      const collaborationId = params['collaborationId'];
      if (collaborationId) {
        this.collaborationService.getCollaboration(collaborationId).subscribe(
          collab => this.selectCollaboration(collab)
        );
      }
    });

    this.selectedCollabId.pipe(
      filter(id => !!id),
      switchMap(id => this.messageService.getMessages(id!))
    ).subscribe(messages => {
      this.messages$.next(messages);
      // Mark unread messages as read
      this.currentUser$.pipe(take(1)).subscribe(currentUser => {
        messages
          .filter(m => !m.read && m.senderId !== currentUser?.id)
          .forEach(m => this.markMessageAsRead(m.id));
      });
    });
  }

  selectCollaboration(collaboration: any) {
    this.selectedCollaboration = collaboration;
    this.selectedCollabId.next(collaboration.id);
  }

  sendMessage() {
    if (!this.newMessage?.trim() || !this.selectedCollaboration) return;
    
    // Validate message length
    if (this.newMessage.length > 5000) {
      // You might want to show a snackbar or error message here
      return;
    }

    const sanitizedMessage = this.validatorService.sanitizeInput(this.newMessage);

    this.messageService.sendMessage({
      content: sanitizedMessage,
      collaborationId: this.selectedCollaboration.id,
      read: true
    }).subscribe(() => {
      this.newMessage = '';
      this.selectedCollabId.next(this.selectedCollaboration.id);
    });
  }

  markMessageAsRead(messageId: string) {
    this.messageService.markAsRead(messageId).subscribe(updatedMessage => {
      // Update the messages list with the new read status
      const currentMessages = this.messages$.getValue();
      const updatedMessages = currentMessages.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      );
      this.messages$.next(updatedMessages);
    });
  }
} 