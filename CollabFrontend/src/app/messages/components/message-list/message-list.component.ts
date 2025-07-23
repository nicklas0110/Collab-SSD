import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Params } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../../auth/services/auth.service';
import { CollaborationService } from '../../../collaboration/services/collaboration.service';
import { SignalRService } from '../../../shared/services/signalr.service';
import { BehaviorSubject, filter, switchMap, take, Subject, takeUntil } from 'rxjs';
import { Message, CreateMessage, MessageType } from '../../interfaces/message.interface';
import { ValidatorService } from '../../../shared/services/validator.service';
import { MessageItemComponent } from '../message-item/message-item.component';

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
    MatListModule,
    MatTooltipModule,
    MessageItemComponent
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
export class MessageListComponent implements OnInit, OnDestroy {
  collaborations$ = this.collaborationService.getCollaborations();
  selectedCollaboration: any = null;
  private selectedCollabId = new BehaviorSubject<string | null>(null);
  messages$ = new BehaviorSubject<Message[]>([]);
  newMessage = '';
  currentUser$ = this.authService.currentUser$;
  replyToMessage: Message | null = null;
  selectedFile: File | null = null;
  typingUsers: string[] = [];
  
  private destroy$ = new Subject<void>();
  private typingTimeout: any;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private collaborationService: CollaborationService,
    private signalRService: SignalRService,
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

    this.setupRealTimeListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private setupRealTimeListeners() {
    // Listen for new messages
    this.signalRService.newMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.collaborationId === this.selectedCollaboration?.id) {
          const currentMessages = this.messages$.getValue();
          this.messages$.next([...currentMessages, message]);
        }
      });

    // Listen for typing indicators
    this.signalRService.typingIndicator$
      .pipe(takeUntil(this.destroy$))
      .subscribe(indicator => {
        if (indicator.collaborationId === this.selectedCollaboration?.id) {
          if (indicator.isTyping) {
            if (!this.typingUsers.includes(indicator.userName)) {
              this.typingUsers.push(indicator.userName);
            }
          } else {
            this.typingUsers = this.typingUsers.filter(u => u !== indicator.userName);
          }
        }
      });
  }

  selectCollaboration(collaboration: any) {
    this.selectedCollaboration = collaboration;
    this.selectedCollabId.next(collaboration.id);
    this.signalRService.joinCollaboration(collaboration.id);
  }

  sendMessage() {
    if (!this.canSend()) return;

    const messageData: CreateMessage = {
      content: this.newMessage.trim(),
      collaborationId: this.selectedCollaboration!.id,
      messageType: this.selectedFile ? this.getFileMessageType() : MessageType.Text,
      replyToMessageId: this.replyToMessage?.id
    };

    // If file is selected, upload it first
    if (this.selectedFile) {
      this.messageService.uploadFile(this.selectedFile).subscribe(uploadResult => {
        messageData.fileUrl = uploadResult.url;
        messageData.fileName = uploadResult.fileName;
        messageData.fileSize = uploadResult.fileSize;
        this.sendMessageWithData(messageData);
      });
    } else {
      this.sendMessageWithData(messageData);
    }
  }

  private sendMessageWithData(messageData: CreateMessage) {
    const sanitizedMessage = this.validatorService.sanitizeInput(messageData.content);
    messageData.content = sanitizedMessage;

    this.messageService.sendMessage(messageData).subscribe(() => {
      this.clearMessageInput();
      this.selectedCollabId.next(this.selectedCollaboration.id);
    });
  }

  onTyping() {
    if (this.selectedCollaboration) {
      this.signalRService.sendTypingIndicator(this.selectedCollaboration.id, true);
      
      // Clear previous timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      // Set timeout to stop typing indicator
      this.typingTimeout = setTimeout(() => {
        this.signalRService.sendTypingIndicator(this.selectedCollaboration.id, false);
      }, 2000);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  setReplyMessage(message: Message) {
    this.replyToMessage = message;
  }

  cancelReply() {
    this.replyToMessage = null;
  }

  deleteMessage(messageId: string) {
    this.messageService.deleteMessage(messageId).subscribe(() => {
      const currentMessages = this.messages$.getValue();
      const updatedMessages = currentMessages.map(msg => 
        msg.id === messageId ? { ...msg, isDeleted: true, content: '' } : msg
      );
      this.messages$.next(updatedMessages);
    });
  }

  forwardMessage(message: Message) {
    // Implementation for message forwarding would go here
    console.log('Forward message:', message);
  }

  getPreviewText(text: string, maxLength = 30): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getTypingText(): string {
    if (this.typingUsers.length === 1) {
      return `${this.typingUsers[0]} is typing...`;
    } else if (this.typingUsers.length > 1) {
      return `${this.typingUsers.length} people are typing...`;
    }
    return '';
  }

  canSend(): boolean {
    return (this.newMessage.trim().length > 0 || !!this.selectedFile) && this.selectedCollaboration !== null;
  }

  private getFileMessageType(): MessageType {
    if (!this.selectedFile) return MessageType.Text;
    
    const fileName = this.selectedFile.name.toLowerCase();
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return MessageType.Image;
    if (fileName.match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) return MessageType.Video;
    if (fileName.match(/\.(mp3|wav|ogg|m4a|flac)$/)) return MessageType.Audio;
    return MessageType.File;
  }

  private clearMessageInput() {
    this.newMessage = '';
    this.selectedFile = null;
    this.replyToMessage = null;
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