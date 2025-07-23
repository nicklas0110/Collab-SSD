import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../../auth/services/auth.service';
import { SignalRService } from '../../../shared/services/signalr.service';
import { Message, User, CreateMessage, MessageType } from '../../interfaces/message.interface';
import { MessageItemComponent } from '../message-item/message-item.component';

@Component({
  selector: 'app-direct-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MessageItemComponent
  ],
  template: `
    <div class="direct-messages-container">
      <!-- Conversations sidebar -->
      <div class="conversations-sidebar">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Direct Messages</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- Search users -->
                         <mat-form-field class="search-field" appearance="outline">
               <mat-label>Search users</mat-label>
               <input matInput [(ngModel)]="searchQuery" placeholder="Type to search users..." (input)="onSearchInput()">
               <mat-icon matSuffix>search</mat-icon>
             </mat-form-field>

            <!-- Conversation list -->
            <mat-nav-list class="conversation-list">
              @for (conversation of conversations$ | async; track conversation.user.id) {
                <a mat-list-item 
                   [class.active]="selectedUser?.id === conversation.user.id"
                   (click)="selectUser(conversation.user)">
                  <div matListItemAvatar class="user-avatar">
                    @if (conversation.user.profilePictureUrl) {
                      <img [src]="conversation.user.profilePictureUrl" [alt]="conversation.user.firstName" class="avatar-img">
                    } @else {
                      <div class="avatar-placeholder">{{ getUserInitials(conversation.user) }}</div>
                    }
                    <!-- Online status indicator -->
                    <div class="status-indicator" [class.online]="conversation.user.isOnline"></div>
                  </div>
                  
                  <div matListItemTitle class="user-info">
                    <span class="user-name">{{ conversation.user.firstName }} {{ conversation.user.lastName }}</span>
                    @if (conversation.user.status) {
                      <span class="user-status">{{ conversation.user.status }}</span>
                    }
                  </div>
                  
                  <div matListItemMeta class="conversation-meta">
                    @if (conversation.lastMessage) {
                      <span class="last-message-time">{{ conversation.lastMessage.createdAt | date:'short' }}</span>
                    }
                    @if (conversation.unreadCount > 0) {
                      <span matBadge="{{ conversation.unreadCount }}" matBadgeColor="accent" matBadgeSize="small"></span>
                    }
                  </div>
                </a>
              } @empty {
                <div class="empty-state">
                  <mat-icon>person_search</mat-icon>
                  <p>No conversations yet</p>
                  <small>Search for users to start chatting</small>
                </div>
              }
            </mat-nav-list>

            <!-- Search results -->
            @if (searchResults$ | async; as searchResults) {
              @if (searchResults.length > 0) {
                <div class="search-results">
                  <h4>Search Results</h4>
                  <mat-nav-list>
                    @for (user of searchResults; track user.id) {
                      <a mat-list-item (click)="selectUser(user)">
                        <div matListItemAvatar class="user-avatar">
                          @if (user.profilePictureUrl) {
                            <img [src]="user.profilePictureUrl" [alt]="user.firstName" class="avatar-img">
                          } @else {
                            <div class="avatar-placeholder">{{ getUserInitials(user) }}</div>
                          }
                          <div class="status-indicator" [class.online]="user.isOnline"></div>
                        </div>
                        <div matListItemTitle>{{ user.firstName }} {{ user.lastName }}</div>
                        <div matListItemSubtitle>{{ user.email }}</div>
                      </a>
                    }
                  </mat-nav-list>
                </div>
              }
            }
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Chat area -->
      <div class="chat-area">
        @if (selectedUser) {
          <mat-card class="chat-card">
            <!-- Chat header -->
            <mat-card-header class="chat-header">
              <div mat-card-avatar class="user-avatar">
                @if (selectedUser.profilePictureUrl) {
                  <img [src]="selectedUser.profilePictureUrl" [alt]="selectedUser.firstName" class="avatar-img">
                } @else {
                  <div class="avatar-placeholder">{{ getUserInitials(selectedUser) }}</div>
                }
                <div class="status-indicator" [class.online]="selectedUser.isOnline"></div>
              </div>
              <mat-card-title>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</mat-card-title>
              <mat-card-subtitle>
                @if (selectedUser.isOnline) {
                  <span class="online-status">Online</span>
                } @else if (selectedUser.lastSeen) {
                  <span class="last-seen">Last seen {{ selectedUser.lastSeen | date:'short' }}</span>
                } @else {
                  <span class="offline-status">Offline</span>
                }
              </mat-card-subtitle>
            </mat-card-header>

            <!-- Messages area -->
            <mat-card-content class="messages-area">
              @if (loadingMessages) {
                <div class="loading-container">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Loading messages...</p>
                </div>
              } @else {
                <!-- Typing indicator -->
                @if (typingUsers.length > 0) {
                  <div class="typing-indicator">
                    <mat-icon class="typing-icon">edit</mat-icon>
                    <span>{{ getTypingText() }}</span>
                  </div>
                }

                <!-- Messages list -->
                <div class="messages-list" #messagesList>
                  @for (message of messages$ | async; track message.id) {
                                         @if (currentUser$ | async; as currentUser) {
                       <app-message-item
                         [message]="message"
                         [currentUser]="currentUser"
                         (replyToMessage)="setReplyMessage($event)"
                         (forwardMessage)="forwardMessage($event)"
                         (deleteMessage)="deleteMessage($event)">
                       </app-message-item>
                     }
                  } @empty {
                    <div class="empty-messages">
                      <mat-icon>chat_bubble_outline</mat-icon>
                      <p>No messages yet</p>
                      <small>Send a message to start the conversation</small>
                    </div>
                  }
                </div>
              }
            </mat-card-content>

            <!-- Message input -->
            <mat-card-actions class="message-input-area">
              <!-- Reply indicator -->
              @if (replyToMessage) {
                <div class="reply-indicator">
                  <mat-icon>reply</mat-icon>
                  <span>Replying to: {{ getPreviewText(replyToMessage.content) }}</span>
                  <button mat-icon-button (click)="cancelReply()">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }

              <!-- File upload area -->
              @if (selectedFile) {
                <div class="file-preview">
                  <mat-icon>attach_file</mat-icon>
                  <span>{{ selectedFile.name }}</span>
                  <button mat-icon-button (click)="removeFile()">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }

              <div class="input-row">
                <button mat-icon-button (click)="fileInput.click()" matTooltip="Attach file">
                  <mat-icon>attach_file</mat-icon>
                </button>

                <mat-form-field class="message-input" appearance="outline">
                  <input matInput 
                         [(ngModel)]="newMessage" 
                         placeholder="Type a message..."
                         maxlength="5000"
                         (keyup.enter)="sendMessage()"
                         (input)="onTyping()"
                         #messageInput>
                  <mat-hint align="end">{{ (newMessage || '').length }}/5000</mat-hint>
                </mat-form-field>

                <button mat-fab 
                        color="primary" 
                        (click)="sendMessage()"
                        [disabled]="!canSend()"
                        matTooltip="Send message">
                  <mat-icon>send</mat-icon>
                </button>
              </div>

              <input #fileInput 
                     type="file" 
                     style="display: none" 
                     (change)="onFileSelected($event)"
                     accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt">
            </mat-card-actions>
          </mat-card>
        } @else {
          <mat-card class="empty-chat">
            <mat-card-content>
              <mat-icon>chat</mat-icon>
              <h3>Select a conversation</h3>
              <p>Choose a user from the sidebar to start chatting</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styleUrls: ['./direct-messages.component.css']
})
export class DirectMessagesComponent implements OnInit, OnDestroy {
  conversations$ = new BehaviorSubject<any[]>([]);
  messages$ = new BehaviorSubject<Message[]>([]);
  searchResults$ = new BehaviorSubject<User[]>([]);
  currentUser$ = this.authService.currentUser$;

  selectedUser: User | null = null;
  newMessage = '';
  searchQuery = '';
  replyToMessage: Message | null = null;
  selectedFile: File | null = null;
  loadingMessages = false;
  typingUsers: string[] = [];

  private destroy$ = new Subject<void>();
  private typingTimeout: any;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private signalRService: SignalRService
  ) {}

  ngOnInit() {
    this.loadConversations();
    this.setupRealTimeListeners();
    this.setupSearch();
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
        if (message.senderId === this.selectedUser?.id || message.recipientId === this.selectedUser?.id) {
          const currentMessages = this.messages$.getValue();
          this.messages$.next([...currentMessages, message]);
          this.scrollToBottom();
        }
        this.loadConversations(); // Refresh conversations list
      });

    // Listen for typing indicators
    this.signalRService.directTypingIndicator$
      .pipe(takeUntil(this.destroy$))
      .subscribe(indicator => {
        if (indicator.userId === this.selectedUser?.id) {
          if (indicator.isTyping) {
            if (!this.typingUsers.includes(indicator.userName)) {
              this.typingUsers.push(indicator.userName);
            }
          } else {
            this.typingUsers = this.typingUsers.filter(u => u !== indicator.userName);
          }
        }
      });

    // Listen for user status updates
    this.signalRService.userStatusUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        // Update user status in conversations
        const conversations = this.conversations$.getValue();
        const updatedConversations = conversations.map(conv => {
          if (conv.user.id === status.userId) {
            return {
              ...conv,
              user: { ...conv.user, isOnline: status.isOnline, lastSeen: status.lastSeen }
            };
          }
          return conv;
        });
        this.conversations$.next(updatedConversations);

        // Update selected user status
        if (this.selectedUser?.id === status.userId) {
          this.selectedUser = { ...this.selectedUser, isOnline: status.isOnline, lastSeen: status.lastSeen };
        }
      });
  }

  private setupSearch() {
    // This will be implemented when the search input is connected
    // For now, we'll handle search directly in the template
  }

  onSearchInput() {
    if (this.searchQuery.trim().length > 0) {
      this.messageService.searchUsers(this.searchQuery).subscribe(results => {
        this.searchResults$.next(results);
      });
    } else {
      this.searchResults$.next([]);
    }
  }

  loadConversations() {
    this.messageService.getConversationParticipants().subscribe(conversations => {
      this.conversations$.next(conversations);
    });
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.loadingMessages = true;
    this.clearSearch();

    this.messageService.getDirectMessages(user.id).subscribe(messages => {
      this.messages$.next(messages);
      this.loadingMessages = false;
      this.scrollToBottom();
    });
  }

  sendMessage() {
    if (!this.canSend()) return;

    const messageData: CreateMessage = {
      content: this.newMessage.trim(),
      recipientId: this.selectedUser!.id,
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
    this.messageService.sendMessage(messageData).subscribe(message => {
      const currentMessages = this.messages$.getValue();
      this.messages$.next([...currentMessages, message]);
      this.clearMessageInput();
      this.scrollToBottom();
    });
  }

  onTyping() {
    if (this.selectedUser) {
      this.signalRService.sendDirectTypingIndicator(this.selectedUser.id, true);
      
      // Clear previous timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      // Set timeout to stop typing indicator
      this.typingTimeout = setTimeout(() => {
        this.signalRService.sendDirectTypingIndicator(this.selectedUser!.id, false);
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

  getUserInitials(user: User): string {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
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
    return (this.newMessage.trim().length > 0 || !!this.selectedFile) && this.selectedUser !== null;
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

  private clearSearch() {
    this.searchQuery = '';
    this.searchResults$.next([]);
  }

  private scrollToBottom() {
    // Implementation would scroll the messages container to bottom
    setTimeout(() => {
      const messagesList = document.querySelector('.messages-list');
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
      }
    }, 100);
  }
}